<?php declare(strict_types = 0);

namespace Modules\SystemResources\Actions;

use API,
	CController,
	CControllerResponseData;

class HostDetails extends CController {

	protected function init(): void {
		$this->disableCsrfValidation();
	}

	protected function checkPermissions(): bool {
		return $this->getUserType() >= USER_TYPE_ZABBIX_USER;
	}

	protected function checkInput(): bool {
		$ret = $this->validateInput(['hostid' => 'id|required']);
		if (!$ret) {
			$this->setJsonResponse([
				'error' => ['messages' => array_column(get_and_clear_messages(), 'message')]
			]);
		}

		return $ret;
	}

	protected function doAction(): void {
		try {
			$this->loadDetails();
		}
		catch (\Throwable $exception) {
			$this->setJsonResponse([
				'error' => ['messages' => [_('No fue posible cargar el detalle del servidor.')]]
			]);
		}
	}

	private function loadDetails(): void {
		$hostid = (string) $this->getInput('hostid');
		$hosts = API::Host()->get([
			'output' => ['hostid', 'host', 'name', 'maintenance_status'],
			'hostids' => [$hostid],
			'selectInterfaces' => ['interfaceid', 'type', 'ip', 'dns', 'useip', 'available'],
			'selectHostGroups' => ['groupid', 'name']
		]);

		if (!$hosts) {
			$this->setJsonResponse(['error' => ['messages' => [_('El host no existe o no es visible para el usuario.')]]]);
			return;
		}

		$host = reset($hosts);
		$items = API::Item()->get([
			'output' => ['itemid', 'name', 'key_', 'lastvalue', 'lastclock', 'value_type', 'units', 'state', 'error'],
			'hostids' => [$hostid],
			'monitored' => true,
			'webitems' => true
		]);

		$by_key = [];
		$disks = [];
		$interfaces = [];
		$services = [];

		foreach ($items as $item) {
			$key = (string) $item['key_'];
			if (!isset($by_key[$key]) || (int) $item['lastclock'] > (int) $by_key[$key]['lastclock']) {
				$by_key[$key] = $item;
			}

			$disk_key = $this->parseFilesystemKey($key);
			if ($disk_key !== null) {
				[$filesystem, $metric] = $disk_key;
				$disks[$filesystem][$metric] = $this->metric($item);
				continue;
			}

			$network_key = $this->parseNetworkKey($key);
			if ($network_key !== null) {
				[$interface, $metric] = $network_key;
				$current = $interfaces[$interface][$metric] ?? null;
				if ($current === null || (int) $item['lastclock'] > (int) $current['lastclock']) {
					$interfaces[$interface][$metric] = $this->metric($item);
				}
				continue;
			}

			if ($this->isServiceStateKey($key)) {
				$services[] = [
					'name' => $item['name'],
					'key' => $key,
					'value' => $item['lastvalue'],
					'lastclock' => (int) $item['lastclock'],
					'status' => $this->serviceStatus($item['lastvalue'])
				];
			}
		}

		foreach ($disks as $filesystem => &$disk) {
			$disk['filesystem'] = $filesystem;
			$total = isset($disk['total']) && is_numeric($disk['total']['value']) ? (float) $disk['total']['value'] : null;
			$used = isset($disk['used']) && is_numeric($disk['used']['value']) ? (float) $disk['used']['value'] : null;
			$free = isset($disk['free']) && is_numeric($disk['free']['value']) ? (float) $disk['free']['value'] : null;
			$pused = isset($disk['pused']) && is_numeric($disk['pused']['value']) ? (float) $disk['pused']['value'] : null;
			if ($used === null && $total !== null && $free !== null) {
				$used = max(0, $total - $free);
			}
			if ($free === null && $total !== null && $used !== null) {
				$free = max(0, $total - $used);
			}
			if ($pused === null && $used !== null && $total !== null && $total > 0) {
				$pused = $used / $total * 100;
			}
			$disk['current'] = compact('used', 'free', 'total', 'pused');
		}
		unset($disk);
		uksort($disks, static function(string $a, string $b): int {
			if ($a === '/') {
				return -1;
			}
			if ($b === '/') {
				return 1;
			}
			return strnatcasecmp($a, $b);
		});
		uksort($interfaces, 'strnatcasecmp');
		usort($services, static function(array $a, array $b): int {
			if ($a['status'] !== $b['status']) {
				return $a['status'] === 'stopped' ? -1 : 1;
			}
			return strnatcasecmp($a['name'], $b['name']);
		});

		$problems = API::Problem()->get([
			'output' => ['eventid', 'name', 'severity', 'clock', 'acknowledged', 'suppressed'],
			'hostids' => [$hostid],
			'source' => 0,
			'object' => 0,
			'recent' => false,
			'sortfield' => ['eventid'],
			'sortorder' => ZBX_SORT_DOWN
		]);

		$address = '';
		foreach ($host['interfaces'] as $interface) {
			if ((int) $interface['type'] === INTERFACE_TYPE_AGENT) {
				$address = (int) $interface['useip'] === 1 ? $interface['ip'] : $interface['dns'];
				break;
			}
		}

		$cpu = $this->firstMetric($by_key, ['system.cpu.util']);
		$ram = $this->firstMetric($by_key, ['vm.memory.util', 'vm.memory.utilization']);
		$memory_total = $this->firstMetric($by_key, ['vm.memory.size[total]']);
		$uptime = $this->firstMetric($by_key, ['system.uptime']);
		$processes = $this->firstMetric($by_key, ['proc.num', 'proc.num[]']);
		$agent = $this->firstMetric($by_key, ['agent.version']);
		$os = $this->firstMetric($by_key, ['system.sw.os', 'system.uname']);

		$this->setJsonResponse([
			'host' => [
				'hostid' => $hostid,
				'name' => $host['name'] !== '' ? $host['name'] : $host['host'],
				'technical_name' => $host['host'],
				'address' => $address,
				'maintenance' => (int) $host['maintenance_status'] === HOST_MAINTENANCE_STATUS_ON,
				'groups' => array_values(array_column($host['hostgroups'], 'name')),
				'agent_version' => $agent['value'] ?? '',
				'os' => $os['value'] ?? _('Sin datos'),
				'cpu' => $cpu,
				'ram' => $ram,
				'memory_total' => $memory_total,
				'uptime' => $uptime,
				'processes' => $processes
			],
			'disks' => array_values($disks),
			'interfaces' => array_map(static function(array $metrics, string $name): array {
				return ['name' => $name, 'metrics' => $metrics];
			}, $interfaces, array_keys($interfaces)),
			'services' => array_slice($services, 0, 250),
			'problems' => array_values($problems),
			'urls' => [
				'latest' => 'zabbix.php?action=latest.view&filter_hostids%5B0%5D='.$hostid.'&filter_set=1',
				'problems' => 'zabbix.php?action=problem.view&filter_hostids%5B0%5D='.$hostid.'&filter_set=1'
			]
		]);
	}

	private function firstMetric(array $items, array $keys): ?array {
		foreach ($keys as $key) {
			if (isset($items[$key])) {
				return $this->metric($items[$key]);
			}
		}
		return null;
	}

	private function metric(array $item): array {
		return [
			'itemid' => (string) $item['itemid'],
			'name' => $item['name'],
			'key' => $item['key_'],
			'value' => $item['lastvalue'],
			'lastclock' => (int) $item['lastclock'],
			'units' => $item['units']
		];
	}

	private function parseFilesystemKey(string $key): ?array {
		foreach (['vfs.fs.dependent.size[', 'vfs.fs.size['] as $prefix) {
			if (strncmp($key, $prefix, strlen($prefix)) !== 0 || substr($key, -1) !== ']') {
				continue;
			}
			$inside = substr($key, strlen($prefix), -1);
			$separator = strrpos($inside, ',');
			if ($separator === false) {
				return null;
			}
			$filesystem = $this->unquote(substr($inside, 0, $separator));
			$metric = trim(substr($inside, $separator + 1));
			return $filesystem !== '' && in_array($metric, ['pused', 'used', 'free', 'total'], true)
				? [$filesystem, $metric]
				: null;
		}
		return null;
	}

	private function parseNetworkKey(string $key): ?array {
		if (!preg_match('/^net\.if\.(in|out|speed|status|errors|collisions)\[(.*)\]$/', $key, $match)) {
			return null;
		}
		$interface = $this->firstArgument($match[2]);
		$metric = $match[1];
		if (in_array($metric, ['in', 'out'], true)
				&& preg_match('/,\s*(errors|dropped)\s*$/i', $match[2])) {
			$metric = 'errors_'.$metric;
		}
		elseif ($metric === 'collisions') {
			$metric = 'errors';
		}
		return $interface !== '' ? [$interface, $metric] : null;
	}

	private function firstArgument(string $arguments): string {
		$quoted = false;
		$escaped = false;
		for ($index = 0, $length = strlen($arguments); $index < $length; $index++) {
			$character = $arguments[$index];
			if ($escaped) {
				$escaped = false;
				continue;
			}
			if ($character === '\\') {
				$escaped = true;
				continue;
			}
			if ($character === '"') {
				$quoted = !$quoted;
			}
			elseif ($character === ',' && !$quoted) {
				return $this->unquote(substr($arguments, 0, $index));
			}
		}
		return $this->unquote($arguments);
	}

	private function unquote(string $value): string {
		$value = trim($value);
		$value = trim($value, '"');
		return str_replace(['\\"', '\\\\'], ['"', '\\'], $value);
	}

	private function isServiceStateKey(string $key): bool {
		return (strncmp($key, 'service.info[', 13) === 0 && substr($key, -7) === ',state]')
			|| (strncmp($key, 'systemd.unit.info[', 18) === 0 && strpos($key, ',ActiveState') !== false);
	}

	private function serviceStatus($value): string {
		$normalized = strtolower(trim((string) $value));
		if ($normalized === '0' || in_array($normalized, ['active', 'running'], true)) {
			return 'running';
		}
		if ($normalized === '6' || in_array($normalized, ['inactive', 'failed', 'stopped', 'dead'], true)) {
			return 'stopped';
		}
		return 'other';
	}

	private function setJsonResponse(array $data): void {
		$this->setResponse(
			(new CControllerResponseData([
				'main_block' => json_encode($data, JSON_THROW_ON_ERROR)
			]))->disableView()
		);
	}
}
