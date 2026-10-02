<?php declare(strict_types = 0);

namespace Modules\SystemResources\Actions;

use API,
	CControllerDashboardWidgetView,
	CControllerResponseData;

use Modules\SystemResources\Widget;

class WidgetView extends CControllerDashboardWidgetView {

	private const WINDOWS_CPU_COUNT_KEY = 'wmi.get[root/cimv2,"Select NumberOfLogicalProcessors from Win32_ComputerSystem"]';

	private const STATIC_KEYS = [
		'agent.ping',
		'agent.version',
		'system.cpu.util',
		'system.cpu.num',
		self::WINDOWS_CPU_COUNT_KEY,
		'vm.memory.util',
		'vm.memory.utilization',
		'vm.memory.size[total]',
		'system.sw.os',
		'system.uname',
		'system.uptime',
		'proc.num',
		'proc.num[]'
	];

	protected function doAction(): void {
		$hosts = $this->getHosts();
		$rows = [];

		if ($hosts) {
			$hostids = array_keys($hosts);
			$items_by_host = $this->getStaticItems($hostids);
			$disks_by_host = $this->getFilesystemItems($hostids);
			$problems_by_host = $this->getProblems($hostids);

			foreach ($hosts as $hostid => $host) {
				$host_items = $items_by_host[$hostid] ?? [];
				if (!$this->hasAgentData($host_items)) {
					continue;
				}

				$os = $this->detectOs($host_items);
				$os_filter = (int) $this->fields_values['os_filter'];

				if (($os_filter === Widget::OS_WINDOWS && $os !== 'windows')
						|| ($os_filter === Widget::OS_LINUX && $os !== 'linux')) {
					continue;
				}

				$rows[] = $this->makeRow(
					$host,
					$host_items,
					$disks_by_host[$hostid] ?? [],
					$problems_by_host[$hostid] ?? [],
					$os
				);
			}
		}

		usort($rows, static function(array $a, array $b): int {
			if ($a['os'] !== $b['os']) {
				return $a['os'] === 'windows' ? -1 : 1;
			}

			return strnatcasecmp($a['name'], $b['name']);
		});

		$rows = array_slice($rows, 0, (int) $this->fields_values['host_limit']);

		$this->setResponse(new CControllerResponseData([
			'name' => $this->getInput('name', $this->widget->getDefaultName()),
			'rows' => $rows,
			'fields_values' => $this->fields_values,
			'generated_at' => time(),
			'user' => [
				'debug_mode' => $this->getDebugMode()
			]
		]));
	}

	private function getHosts(): array {
		if ($this->isTemplateDashboard()) {
			return [];
		}

		$options = [
			'output' => ['hostid', 'host', 'name', 'maintenance_status'],
			'selectInterfaces' => ['interfaceid', 'type', 'ip', 'dns', 'useip', 'available'],
			'monitored_hosts' => true,
			'preservekeys' => true
		];

		if ($this->fields_values['groupids']) {
			$options['groupids'] = getSubGroups($this->fields_values['groupids']);
		}

		if ($this->fields_values['hostids']) {
			$options['hostids'] = $this->fields_values['hostids'];
		}

		if ((int) $this->fields_values['maintenance'] === HOST_MAINTENANCE_STATUS_OFF) {
			$options['filter'] = ['maintenance_status' => HOST_MAINTENANCE_STATUS_OFF];
		}

		return API::Host()->get($options);
	}

	private function getStaticItems(array $hostids): array {
		$db_items = API::Item()->get([
			'output' => ['itemid', 'hostid', 'name', 'key_', 'lastvalue', 'lastclock', 'value_type', 'units'],
			'hostids' => $hostids,
			'filter' => ['key_' => self::STATIC_KEYS],
			'monitored' => true,
			'webitems' => true
		]);

		$result = [];
		foreach ($db_items as $item) {
			$hostid = (string) $item['hostid'];
			$key = $item['key_'];

			if (!array_key_exists($hostid, $result)) {
				$result[$hostid] = [];
			}

			if (!array_key_exists($key, $result[$hostid])
					|| (int) $item['lastclock'] > (int) $result[$hostid][$key]['lastclock']) {
				$result[$hostid][$key] = $item;
			}
		}

		return $result;
	}

	private function getFilesystemItems(array $hostids): array {
		$db_items = API::Item()->get([
			'output' => ['itemid', 'hostid', 'name', 'key_', 'lastvalue', 'lastclock', 'value_type', 'units'],
			'hostids' => $hostids,
			'search' => ['key_' => 'vfs.fs.'],
			'startSearch' => true,
			'monitored' => true,
			'webitems' => true
		]);

		$result = [];

		foreach ($db_items as $item) {
			$parsed = $this->parseFilesystemKey($item['key_']);
			if ($parsed === null) {
				continue;
			}

			[$filesystem, $metric] = $parsed;
			$hostid = (string) $item['hostid'];
			$result[$hostid][$filesystem][$metric] = $item;
		}

		foreach ($result as &$host_disks) {
			foreach ($host_disks as $filesystem => &$disk) {
				$total = isset($disk['total']) && is_numeric($disk['total']['lastvalue'])
					? (float) $disk['total']['lastvalue']
					: null;
				$used = isset($disk['used']) && is_numeric($disk['used']['lastvalue'])
					? (float) $disk['used']['lastvalue']
					: null;
				$free = isset($disk['free']) && is_numeric($disk['free']['lastvalue'])
					? (float) $disk['free']['lastvalue']
					: null;

				if ($used === null && $total !== null && $free !== null) {
					$used = max(0, $total - $free);
					$disk['calculated_used'] = $used;
				}
				if ($free === null && $total !== null && $used !== null) {
					$free = max(0, $total - $used);
					$disk['calculated_free'] = $free;
				}
				if (!isset($disk['pused']) && $used !== null && $total !== null && $total > 0) {
					$disk['calculated_pused'] = $used / $total * 100;
				}

				$disk['filesystem'] = $filesystem;
			}
			unset($disk);

			uksort($host_disks, static function(string $a, string $b): int {
				if ($a === '/') {
					return -1;
				}
				if ($b === '/') {
					return 1;
				}

				return strnatcasecmp($a, $b);
			});
		}
		unset($host_disks);

		return $result;
	}

	private function getProblems(array $hostids): array {
		$requested_hostids = array_fill_keys(array_map('strval', $hostids), true);
		$problems = API::Problem()->get([
			'output' => ['eventid', 'objectid', 'name', 'severity', 'clock', 'acknowledged', 'suppressed'],
			'hostids' => $hostids,
			'source' => 0,
			'object' => 0,
			'recent' => false,
			'sortfield' => ['eventid'],
			'sortorder' => ZBX_SORT_DOWN
		]);

		if (!$problems) {
			return [];
		}

		$triggerids = array_values(array_unique(array_column($problems, 'objectid')));
		$triggers = API::Trigger()->get([
			'output' => ['triggerid'],
			'triggerids' => $triggerids,
			'selectHosts' => ['hostid'],
			'preservekeys' => true
		]);

		$result = [];
		foreach ($problems as $problem) {
			$trigger = $triggers[(string) $problem['objectid']] ?? null;
			if ($trigger === null) {
				continue;
			}

			foreach ($trigger['hosts'] as $host) {
				$hostid = (string) $host['hostid'];
				if (isset($requested_hostids[$hostid])) {
					$result[$hostid][] = $problem;
				}
			}
		}

		return $result;
	}

	private function parseFilesystemKey(string $key): ?array {
		$prefixes = ['vfs.fs.dependent.size[', 'vfs.fs.size['];

		foreach ($prefixes as $prefix) {
			if (strncmp($key, $prefix, strlen($prefix)) !== 0 || substr($key, -1) !== ']') {
				continue;
			}

			$inside = substr($key, strlen($prefix), -1);
			$separator = strrpos($inside, ',');
			if ($separator === false) {
				return null;
			}

			$filesystem = trim(substr($inside, 0, $separator));
			$filesystem = trim($filesystem, '"');
			$filesystem = str_replace(['\\"', '\\\\'], ['"', '\\'], $filesystem);
			$metric = trim(substr($inside, $separator + 1));

			if ($filesystem === '' || !in_array($metric, ['pused', 'used', 'free', 'total'], true)) {
				return null;
			}

			return [$filesystem, $metric];
		}

		return null;
	}

	private function hasAgentData(array $items): bool {
		return isset($items['agent.ping'])
			|| isset($items['agent.version'])
			|| isset($items['system.cpu.util'])
			|| isset($items['system.uptime']);
	}

	private function detectOs(array $items): string {
		$description = strtolower((string) ($items['system.sw.os']['lastvalue']
			?? $items['system.uname']['lastvalue']
			?? ''));

		return strpos($description, 'windows') !== false || isset($items[self::WINDOWS_CPU_COUNT_KEY])
			? 'windows'
			: 'linux';
	}

	private function makeRow(array $host, array $items, array $disks, array $problems, string $os): array {
		$cpu_count_key = $os === 'windows' && isset($items[self::WINDOWS_CPU_COUNT_KEY])
			? self::WINDOWS_CPU_COUNT_KEY
			: 'system.cpu.num';
		$memory_key = isset($items['vm.memory.util'])
			? 'vm.memory.util'
			: 'vm.memory.utilization';

		$latest_clock = 0;
		foreach (['agent.ping', 'system.cpu.util', $memory_key, 'system.uptime'] as $key) {
			if (isset($items[$key])) {
				$latest_clock = max($latest_clock, (int) $items[$key]['lastclock']);
			}
		}

		$stale_seconds = (int) $this->fields_values['stale_seconds'];
		$ping = $items['agent.ping'] ?? null;
		if ($latest_clock === 0) {
			$availability = 'unknown';
		}
		elseif (time() - $latest_clock > $stale_seconds) {
			$availability = 'stale';
		}
		elseif ($ping !== null && (string) $ping['lastvalue'] !== '1') {
			$availability = 'down';
		}
		else {
			$availability = 'up';
		}

		$address = '';
		foreach ($host['interfaces'] as $interface) {
			if ((int) $interface['type'] === INTERFACE_TYPE_AGENT) {
				$address = (int) $interface['useip'] === 1 ? $interface['ip'] : $interface['dns'];
				break;
			}
		}

		$os_description = (string) ($items['system.sw.os']['lastvalue']
			?? $items['system.uname']['lastvalue']
			?? 'Sin datos');

		$problem_summary = [
			'total' => count($problems),
			'critical' => 0,
			'warning' => 0,
			'information' => 0,
			'suppressed' => 0,
			'max_severity' => 0
		];
		foreach ($problems as $problem) {
			$severity = (int) $problem['severity'];
			if ((string) ($problem['suppressed'] ?? '0') === '1') {
				$problem_summary['suppressed']++;
			}
			else {
				$problem_summary['max_severity'] = max($problem_summary['max_severity'], $severity);
			}
			if ($severity >= 4) {
				$problem_summary['critical']++;
			}
			elseif ($severity >= 2) {
				$problem_summary['warning']++;
			}
			else {
				$problem_summary['information']++;
			}
		}

		$resource_level = 0;
		foreach ([$items['system.cpu.util'] ?? null, $items[$memory_key] ?? null] as $item) {
			if ($item !== null && is_numeric($item['lastvalue'])) {
				$resource_level = max($resource_level, $this->resourceSeverity((float) $item['lastvalue']));
			}
		}
		$disk_max = null;
		foreach ($disks as &$disk) {
			$assessment = $this->diskAssessment($disk);
			$pused = $assessment['pused'];
			$disk['alert_level'] = $assessment['severity'];
			$disk['alert_basis'] = $assessment['basis'];
			if ($pused !== null) {
				$disk_max = $disk_max === null ? (float) $pused : max($disk_max, (float) $pused);
			}
			$resource_level = max($resource_level, $assessment['severity']);
		}
		unset($disk);

		$is_maintenance = (int) $host['maintenance_status'] === HOST_MAINTENANCE_STATUS_ON;
		if ($is_maintenance) {
			$health = 'maintenance';
		}
		elseif ($availability === 'down') {
			$health = 'critical';
		}
		elseif (in_array($availability, ['stale', 'unknown'], true)) {
			$health = 'nodata';
		}
		elseif ($problem_summary['max_severity'] >= 4 || $resource_level >= 4) {
			$health = 'critical';
		}
		elseif ($problem_summary['max_severity'] >= 2 || $resource_level >= 2) {
			$health = 'warning';
		}
		else {
			$health = 'normal';
		}

		return [
			'hostid' => (string) $host['hostid'],
			'name' => $host['name'] !== '' ? $host['name'] : $host['host'],
			'host' => $host['host'],
			'address' => $address,
			'os' => $os,
			'os_description' => $os_description,
			'availability' => $availability,
			'lastclock' => $latest_clock,
			'maintenance' => $is_maintenance,
			'health' => $health,
			'problems' => $problem_summary,
			'disk_max' => $disk_max,
			'agent_version' => (string) ($items['agent.version']['lastvalue'] ?? ''),
			'cpu' => $this->metric($items['system.cpu.util'] ?? null),
			'cpu_count' => $this->metric($items[$cpu_count_key] ?? null),
			'memory' => $this->metric($items[$memory_key] ?? null),
			'memory_total' => $this->metric($items['vm.memory.size[total]'] ?? null),
			'uptime' => $this->metric($items['system.uptime'] ?? null),
			'processes' => $this->metric($items['proc.num'] ?? $items['proc.num[]'] ?? null),
			'disks' => array_values($disks)
		];
	}

	private function resourceSeverity(float $value): int {
		$warn = min(
			(float) $this->fields_values['warn_threshold'],
			(float) $this->fields_values['crit_threshold']
		);
		$crit = max(
			(float) $this->fields_values['warn_threshold'],
			(float) $this->fields_values['crit_threshold']
		);

		return $value >= $crit ? 4 : ($value >= $warn ? 2 : 0);
	}

	private function diskAssessment(array $disk): array {
		$pused = isset($disk['pused']) && is_numeric($disk['pused']['lastvalue'])
			? (float) $disk['pused']['lastvalue']
			: (isset($disk['calculated_pused']) ? (float) $disk['calculated_pused'] : null);
		$total = isset($disk['total']) && is_numeric($disk['total']['lastvalue'])
			? (float) $disk['total']['lastvalue']
			: null;
		$used = isset($disk['used']) && is_numeric($disk['used']['lastvalue'])
			? (float) $disk['used']['lastvalue']
			: (isset($disk['calculated_used']) ? (float) $disk['calculated_used'] : null);
		$free = isset($disk['free']) && is_numeric($disk['free']['lastvalue'])
			? (float) $disk['free']['lastvalue']
			: (isset($disk['calculated_free']) ? (float) $disk['calculated_free'] : null);

		if ($free === null && $total !== null && $used !== null) {
			$free = max(0, $total - $used);
		}

		if ((int) $this->fields_values['disk_alert_mode'] === Widget::DISK_ALERT_FREE_GB
				&& $free !== null && $total !== null) {
			$warn_free = max(
				(float) $this->fields_values['disk_warn_free_gb'],
				(float) $this->fields_values['disk_crit_free_gb']
			);
			$crit_free = min(
				(float) $this->fields_values['disk_warn_free_gb'],
				(float) $this->fields_values['disk_crit_free_gb']
			);
			$total_gb = $total / 1073741824;

			// Small filesystems such as /boot cannot satisfy large absolute thresholds.
			if ($total_gb >= $warn_free) {
				$free_gb = $free / 1073741824;
				return [
					'severity' => $free_gb < $crit_free ? 4 : ($free_gb < $warn_free ? 2 : 0),
					'basis' => 'free_gb',
					'pused' => $pused
				];
			}
		}

		$warn_percent = min(
			(float) $this->fields_values['disk_warn_percent'],
			(float) $this->fields_values['disk_crit_percent']
		);
		$crit_percent = max(
			(float) $this->fields_values['disk_warn_percent'],
			(float) $this->fields_values['disk_crit_percent']
		);

		return [
			'severity' => $pused === null ? 0 : ($pused >= $crit_percent ? 4 : ($pused >= $warn_percent ? 2 : 0)),
			'basis' => (int) $this->fields_values['disk_alert_mode'] === Widget::DISK_ALERT_FREE_GB
				? 'percent_fallback'
				: 'percent',
			'pused' => $pused
		];
	}

	private function metric(?array $item): ?array {
		if ($item === null || $item['lastvalue'] === '') {
			return null;
		}

		return [
			'itemid' => (string) $item['itemid'],
			'name' => $item['name'],
			'key' => $item['key_'],
			'value' => $item['lastvalue'],
			'lastclock' => (int) $item['lastclock'],
			'units' => $item['units']
		];
	}
}
