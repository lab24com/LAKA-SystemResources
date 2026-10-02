<?php declare(strict_types = 0);

/**
 * Recursos de servidores widget view.
 *
 * @var CView $this
 * @var array $data
 */

$language = [0 => 'es', 1 => 'en', 2 => 'pt_BR'][(int) ($data['fields_values']['display_language'] ?? 0)] ?? 'es';
$translations = [
	'en' => [
		'Abrir histórico de' => 'Open history for', 'Alerta por espacio libre' => 'Free-space alert',
		'advertencia' => 'warning', 'crítico' => 'critical',
		'Partición pequeña, evaluación porcentual' => 'Small partition, percentage evaluation',
		'Alerta porcentual' => 'Percentage alert', 'usado' => 'used', 'Utilizado' => 'Used',
		'Libre' => 'Free', 'Disco' => 'Disk', 'Clic para abrir el histórico' => 'Click to open history',
		'Estado' => 'Status', 'Servidor' => 'Server', 'RAM total' => 'Total RAM', 'Discos' => 'Disks',
		'Sistema operativo' => 'Operating system', 'Problemas' => 'Problems', 'Uptime' => 'Uptime',
		'Normal' => 'Normal', 'Advertencia' => 'Warning', 'Crítico' => 'Critical', 'Sin datos' => 'No data',
		'Mantenimiento' => 'Maintenance', 'Último dato' => 'Last data', 'problemas activos' => 'active problems',
		'Abrir consola detallada del servidor' => 'Open detailed server console', 'críticos' => 'critical',
		'advertencias' => 'warnings', 'informativos' => 'informational',
		'Abrir problemas activos en Zabbix' => 'Open active problems in Zabbix', 'Ordenar por' => 'Sort by',
		'Buscar servidor, IP o sistema operativo…' => 'Search server, IP or operating system…',
		'Buscar servidores' => 'Search servers', 'Total' => 'Total', 'En línea' => 'Online',
		'Advertencias' => 'Warnings', 'Críticos' => 'Critical', 'Todos' => 'All', 'servidores' => 'servers',
		'No se encontraron servidores con métricas de Zabbix agent.' => 'No servers with Zabbix agent metrics were found.',
		'Verifique el grupo seleccionado, los permisos y que la plantilla oficial esté vinculada.' => 'Check the selected group, permissions and that the official template is linked.',
		'Servidores Windows' => 'Windows servers', 'Servidores Linux' => 'Linux servers',
		'Actualizado' => 'Updated'
	],
	'pt_BR' => [
		'Abrir histórico de' => 'Abrir histórico de', 'Alerta por espacio libre' => 'Alerta por espaço livre',
		'advertencia' => 'aviso', 'crítico' => 'crítico',
		'Partición pequeña, evaluación porcentual' => 'Partição pequena, avaliação percentual',
		'Alerta porcentual' => 'Alerta percentual', 'usado' => 'usado', 'Utilizado' => 'Utilizado',
		'Libre' => 'Livre', 'Disco' => 'Disco', 'Clic para abrir el histórico' => 'Clique para abrir o histórico',
		'Estado' => 'Estado', 'Servidor' => 'Servidor', 'RAM total' => 'RAM total', 'Discos' => 'Discos',
		'Sistema operativo' => 'Sistema operacional', 'Problemas' => 'Problemas', 'Uptime' => 'Tempo ativo',
		'Normal' => 'Normal', 'Advertencia' => 'Aviso', 'Crítico' => 'Crítico', 'Sin datos' => 'Sem dados',
		'Mantenimiento' => 'Manutenção', 'Último dato' => 'Último dado', 'problemas activos' => 'problemas ativos',
		'Abrir consola detallada del servidor' => 'Abrir console detalhado do servidor', 'críticos' => 'críticos',
		'advertencias' => 'avisos', 'informativos' => 'informativos',
		'Abrir problemas activos en Zabbix' => 'Abrir problemas ativos no Zabbix', 'Ordenar por' => 'Ordenar por',
		'Buscar servidor, IP o sistema operativo…' => 'Pesquisar servidor, IP ou sistema operacional…',
		'Buscar servidores' => 'Pesquisar servidores', 'Total' => 'Total', 'En línea' => 'Online',
		'Advertencias' => 'Avisos', 'Críticos' => 'Críticos', 'Todos' => 'Todos', 'servidores' => 'servidores',
		'No se encontraron servidores con métricas de Zabbix agent.' => 'Nenhum servidor com métricas do Zabbix agent foi encontrado.',
		'Verifique el grupo seleccionado, los permisos y que la plantilla oficial esté vinculada.' => 'Verifique o grupo selecionado, as permissões e se o template oficial está vinculado.',
		'Servidores Windows' => 'Servidores Windows', 'Servidores Linux' => 'Servidores Linux',
		'Actualizado' => 'Atualizado'
	]
];
$t = static fn(string $text): string => $translations[$language][$text] ?? $text;

$warn_value = (float) $data['fields_values']['warn_threshold'];
$crit_value = (float) $data['fields_values']['crit_threshold'];
$warn = min($warn_value, $crit_value);
$crit = max($warn_value, $crit_value);
$disk_alert_mode = (int) $data['fields_values']['disk_alert_mode'];
$disk_warn_free = max(
	(float) $data['fields_values']['disk_warn_free_gb'],
	(float) $data['fields_values']['disk_crit_free_gb']
);
$disk_crit_free = min(
	(float) $data['fields_values']['disk_warn_free_gb'],
	(float) $data['fields_values']['disk_crit_free_gb']
);
$disk_warn_percent = min(
	(float) $data['fields_values']['disk_warn_percent'],
	(float) $data['fields_values']['disk_crit_percent']
);
$disk_crit_percent = max(
	(float) $data['fields_values']['disk_warn_percent'],
	(float) $data['fields_values']['disk_crit_percent']
);

$format_bytes = static function($bytes): string {
	if ($bytes === null || $bytes === '') {
		return '—';
	}

	$value = (float) $bytes;
	$units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	$index = 0;

	while (abs($value) >= 1024 && $index < count($units) - 1) {
		$value /= 1024;
		$index++;
	}

	return ($value >= 100 || $index === 0 ? number_format($value, 0) : number_format($value, 1)).' '.$units[$index];
};

$format_uptime = static function($seconds): string {
	if ($seconds === null || $seconds === '') {
		return '—';
	}

	$seconds = max(0, (int) $seconds);
	$days = intdiv($seconds, SEC_PER_DAY);
	$hours = intdiv($seconds % SEC_PER_DAY, SEC_PER_HOUR);
	$minutes = intdiv($seconds % SEC_PER_HOUR, SEC_PER_MIN);

	if ($days > 0) {
		return $days.'d '.$hours.'h '.$minutes.'m';
	}
	if ($hours > 0) {
		return $hours.'h '.$minutes.'m';
	}

	return $minutes.'m';
};

$level_class = static function(?float $value) use ($warn, $crit): string {
	if ($value === null) {
		return 'sr-level-none';
	}
	if ($value >= $crit) {
		return 'sr-level-critical';
	}
	if ($value >= $warn) {
		return 'sr-level-warning';
	}

	return 'sr-level-ok';
};

$metric_attributes = static function(CTag $tag, ?array $metric, string $title) use ($t): CTag {
	if ($metric === null) {
		return $tag;
	}

	return $tag
		->addClass('sr-metric')
		->setAttribute('type', 'button')
		->setAttribute('data-itemid', $metric['itemid'])
		->setAttribute('data-title', $title)
		->setAttribute('title', $t('Abrir histórico de').' '.$title);
};

$percent_cell = static function(?array $metric, string $title, array $context = []) use ($metric_attributes, $level_class): CTag {
	$value = $metric !== null && is_numeric($metric['value']) ? (float) $metric['value'] : null;
	$percent = $value !== null ? max(0, min(100, $value)) : 0;
	$caption = $value !== null ? number_format($value, 1).'%' : '—';

	$meter = (new CDiv(
		(new CSpan())->addClass('sr-meter-fill')->setAttribute('style', 'width: '.$percent.'%')
	))->addClass('sr-meter');

	$tag = (new CTag($metric !== null ? 'button' : 'span', true, [
		$meter,
		(new CSpan($caption))->addClass('sr-meter-value')
	]))
		->addClass('sr-meter-wrap')
		->addClass($level_class($value));

	$tag = $metric_attributes($tag, $metric, $title);
	foreach ($context as $name => $context_value) {
		if ($context_value !== null && $context_value !== '') {
			$tag->setAttribute('data-'.$name, (string) $context_value);
		}
	}
	return $tag->setAttribute('data-sort-value', $value !== null ? (string) $value : '-1');
};

$value_cell = static function(?array $metric, string $caption, string $title, string $extra_class = '') use ($metric_attributes): CTag {
	$tag = (new CTag($metric !== null ? 'button' : 'span', true, $caption))
		->addClass('sr-value')
		->addClass($extra_class);

	$tag = $metric_attributes($tag, $metric, $title);
	return $tag->setAttribute(
		'data-sort-value',
		$metric !== null && is_numeric($metric['value']) ? (string) $metric['value'] : '-1'
	);
};

$disk_badge = static function(array $disk) use (
	$format_bytes,
	$metric_attributes,
	$disk_warn_free,
	$disk_crit_free,
	$disk_warn_percent,
	$disk_crit_percent,
	$t
): CTag {
	$pused = null;
	if (isset($disk['pused']) && is_numeric($disk['pused']['lastvalue'])) {
		$pused = (float) $disk['pused']['lastvalue'];
	}
	elseif (isset($disk['calculated_pused'])) {
		$pused = (float) $disk['calculated_pused'];
	}

	$metric = isset($disk['pused'])
		? [
			'itemid' => (string) $disk['pused']['itemid'],
			'name' => $disk['pused']['name'],
			'key' => $disk['pused']['key_'],
			'value' => $disk['pused']['lastvalue'],
			'lastclock' => (int) $disk['pused']['lastclock'],
			'units' => $disk['pused']['units']
		]
		: (isset($disk['used']) ? [
			'itemid' => (string) $disk['used']['itemid'],
			'name' => $disk['used']['name'],
			'key' => $disk['used']['key_'],
			'value' => $disk['used']['lastvalue'],
			'lastclock' => (int) $disk['used']['lastclock'],
			'units' => $disk['used']['units']
		] : null);

	$filesystem = $disk['filesystem'];
	$label = preg_match('/^[A-Za-z]:$/', $filesystem) ? strtoupper($filesystem) : $filesystem;
	$total_value = isset($disk['total']) && is_numeric($disk['total']['lastvalue'])
		? (float) $disk['total']['lastvalue']
		: null;
	$free_value = isset($disk['free']) && is_numeric($disk['free']['lastvalue'])
		? (float) $disk['free']['lastvalue']
		: (isset($disk['calculated_free']) ? (float) $disk['calculated_free'] : null);
	$used_value = isset($disk['used']) && is_numeric($disk['used']['lastvalue'])
		? (float) $disk['used']['lastvalue']
		: (isset($disk['calculated_used'])
			? (float) $disk['calculated_used']
			: ($total_value !== null && $free_value !== null ? max(0, $total_value - $free_value) : null));
	$total = $total_value !== null ? $format_bytes($total_value) : '—';
	$free = $free_value !== null ? $format_bytes($free_value) : '—';
	$used_caption = $pused !== null ? number_format($pused, 1).'%' : $t('Sin datos');
	$used = $used_value !== null ? $format_bytes($used_value) : '—';
	$alert_basis = $disk['alert_basis'] ?? 'percent';
	$alert_rule = $alert_basis === 'free_gb'
		? sprintf('%s: %s < %s GB · %s < %s GB', $t('Alerta por espacio libre'), $t('advertencia'),
			number_format($disk_warn_free, 0), $t('crítico'), number_format($disk_crit_free, 0))
		: sprintf('%s: %s ≥ %s%% · %s ≥ %s%%',
			$t($alert_basis === 'percent_fallback' ? 'Partición pequeña, evaluación porcentual' : 'Alerta porcentual'),
			$t('advertencia'),
			number_format($disk_warn_percent, 0), $t('crítico'), number_format($disk_crit_percent, 0));
	$title = sprintf('%s · %s %s · %s: %s · %s: %s · %s: %s · %s',
		$filesystem, $used_caption, $t('usado'), $t('Utilizado'), $used, $t('Libre'), $free, $t('Total'), $total, $alert_rule
	);
	$badge_caption = $label.' '.($pused !== null ? number_format($pused, 0).'%' : '—');
	$alert_level = (int) ($disk['alert_level'] ?? -1);
	$alert_available = $alert_basis === 'free_gb' ? $free_value !== null : $pused !== null;
	$level = $alert_level >= 4
		? 'sr-level-critical'
		: ($alert_level >= 2 ? 'sr-level-warning' : ($alert_available ? 'sr-level-ok' : 'sr-level-none'));

	$tag = (new CTag($metric !== null ? 'button' : 'span', true,
		(new CSpan($badge_caption))->addClass('sr-disk-label')
	))
		->addClass('sr-disk')
		->addClass($level)
		->setAttribute('title', $title);

	$tag = $metric_attributes($tag, $metric, $t('Disco').' '.$filesystem);
	if ($metric !== null) {
		$tag
			->setAttribute('title', $title.' · '.$t('Clic para abrir el histórico'))
			->setAttribute('data-resource-type', 'disk')
			->setAttribute('data-disk-label', $label)
			->setAttribute('data-level', substr($level, strlen('sr-level-')));

		if ($pused !== null) {
			$tag->setAttribute('data-current-pused', (string) $pused);
		}
		if ($used_value !== null) {
			$tag->setAttribute('data-current-used', (string) $used_value);
		}
		if ($free_value !== null) {
			$tag->setAttribute('data-current-free', (string) $free_value);
		}
		if ($total_value !== null) {
			$tag->setAttribute('data-current-total', (string) $total_value);
		}
	}

	return $tag;
};

$sort_header = static function(string $label, string $key) use ($t): CTag {
	return (new CTag('button', true, [$label, (new CSpan('↕'))->addClass('sr-sort-icon')]))
		->setAttribute('type', 'button')
		->setAttribute('data-sort-key', $key)
		->setAttribute('aria-label', $t('Ordenar por').' '.$label)
		->addClass('sr-sort');
};

$make_table = static function(array $rows) use (
	$format_bytes,
	$format_uptime,
	$percent_cell,
	$value_cell,
	$disk_badge,
	$sort_header,
	$t
): CTableInfo {
	$table = (new CTableInfo())
		->setHeader([
			$sort_header($t('Estado'), 'health'),
			$sort_header($t('Servidor'), 'name'),
			$sort_header(_('CPU'), 'cpu'),
			$sort_header(_('vCPU'), 'vcpu'),
			$sort_header(_('RAM'), 'ram'),
			$sort_header($t('RAM total'), 'memory'),
			$sort_header($t('Discos'), 'disk'),
			$t('Sistema operativo'),
			$sort_header($t('Problemas'), 'problems'),
			$sort_header($t('Uptime'), 'uptime')
		])
		->addClass('sr-table');

	$health_labels = [
		'normal' => $t('Normal'),
		'warning' => $t('Advertencia'),
		'critical' => $t('Crítico'),
		'nodata' => $t('Sin datos'),
		'maintenance' => $t('Mantenimiento')
	];
	$health_rank = ['normal' => 0, 'maintenance' => 1, 'nodata' => 2, 'warning' => 3, 'critical' => 4];

	foreach ($rows as $row) {
		$status_title = $health_labels[$row['health']];
		if ($row['lastclock'] > 0) {
			$status_title .= ' · '.$t('Último dato').': '.zbx_date2str(DATE_TIME_FORMAT_SECONDS, $row['lastclock']);
		}
		if ($row['agent_version'] !== '') {
			$status_title .= ' · Agent '.$row['agent_version'];
		}
		if ($row['problems']['total'] > 0) {
			$status_title .= ' · '.$row['problems']['total'].' '.$t('problemas activos');
		}

		$status = (new CSpan($health_labels[$row['health']]))
			->addClass('sr-status sr-status-'.$row['health'])
			->setAttribute('data-sort-value', (string) $health_rank[$row['health']])
			->setAttribute('title', $status_title);

		$host_meta = array_filter([
			$row['address'],
			$row['agent_version'] !== '' ? 'Agent '.$row['agent_version'] : null,
			$row['maintenance'] ? $t('Mantenimiento') : null
		]);

		$host_cell = (new CDiv([
			(new CTag('button', true, $row['name']))
				->setAttribute('type', 'button')
				->setAttribute('data-hostid', $row['hostid'])
				->setAttribute('data-sort-value', strtolower($row['name']))
				->setAttribute('title', $t('Abrir consola detallada del servidor'))
				->addClass('sr-host-open'),
			(new CDiv(implode(' · ', $host_meta)))->addClass('sr-host-meta')
		]))->addClass('sr-host');

		$disks = (new CDiv())
			->addClass('sr-disks')
			->setAttribute('data-sort-value', $row['disk_max'] !== null ? (string) $row['disk_max'] : '-1');
		if ($row['disks']) {
			foreach ($row['disks'] as $disk) {
				$disks->addItem($disk_badge($disk));
			}
		}
		else {
			$disks->addItem((new CSpan('—'))->addClass('sr-empty'));
		}

		$os_label = (new CDiv([
			(new CSpan($row['os'] === 'windows' ? 'Windows' : 'Linux'))->addClass('sr-os-badge sr-os-'.$row['os']),
			(new CSpan($row['os_description']))->addClass('sr-os-text')->setAttribute('title', $row['os_description'])
		]))->addClass('sr-os');

		$cpu_count = $row['cpu_count'] !== null ? number_format((float) $row['cpu_count']['value'], 0) : '—';
		$problems_url = (new CUrl('zabbix.php'))
			->setArgument('action', 'problem.view')
			->setArgument('filter_hostids', [$row['hostid']])
			->setArgument('filter_set', 1);
		if ($row['problems']['critical'] > 0) {
			$problem_caption = $row['problems']['critical'].' '.$t('críticos');
			$problem_level = 'critical';
		}
		elseif ($row['problems']['warning'] > 0) {
			$problem_caption = $row['problems']['warning'].' '.$t('advertencias');
			$problem_level = 'warning';
		}
		elseif ($row['problems']['total'] > 0) {
			$problem_caption = $row['problems']['total'].' '.$t('informativos');
			$problem_level = 'information';
		}
		else {
			$problem_caption = $t('Normal');
			$problem_level = 'normal';
		}
		$problem_cell = (new CLink($problem_caption, $problems_url))
			->addClass('sr-problems sr-problems-'.$problem_level)
			->setAttribute('data-sort-value', (string) $row['problems']['total'])
			->setAttribute('title', $t('Abrir problemas activos en Zabbix'));

		$table->addRow([
			$status,
			$host_cell,
			$percent_cell($row['cpu'], $row['name'].' · CPU', [
				'resource-type' => 'cpu',
				'current-pused' => $row['cpu']['value'] ?? null,
				'current-total' => $row['cpu_count']['value'] ?? null
			]),
			$value_cell($row['cpu_count'], $cpu_count, $row['name'].' · vCPU'),
			$percent_cell($row['memory'], $row['name'].' · RAM', [
				'resource-type' => 'ram',
				'current-pused' => $row['memory']['value'] ?? null,
				'current-total' => $row['memory_total']['value'] ?? null
			]),
			$value_cell($row['memory_total'], $row['memory_total'] !== null
				? $format_bytes($row['memory_total']['value'])
				: '—', $row['name'].' · '.$t('RAM total')),
			$disks,
			$os_label,
			$problem_cell,
			$value_cell($row['uptime'], $row['uptime'] !== null
				? $format_uptime($row['uptime']['value'])
				: '—', $row['name'].' · Uptime', 'sr-uptime')
		], 'sr-host-row sr-host-'.$row['os'].' sr-host-'.$row['availability'].' sr-health-'.$row['health']);
	}

	return $table;
};

$root = (new CDiv())
	->addClass('sr-root')
	->setAttribute('data-language', $language)
	->setAttribute('data-disk-alert-mode', (string) $disk_alert_mode)
	->setAttribute('data-disk-warn-free-gb', (string) $disk_warn_free)
	->setAttribute('data-disk-crit-free-gb', (string) $disk_crit_free)
	->setAttribute('data-disk-warn-percent', (string) $disk_warn_percent)
	->setAttribute('data-disk-crit-percent', (string) $disk_crit_percent);

$search = (new CTag('input', false))
	->setAttribute('type', 'search')
	->setAttribute('placeholder', $t('Buscar servidor, IP o sistema operativo…'))
	->setAttribute('aria-label', $t('Buscar servidores'))
	->addClass('sr-search');

$summary = [
	'all' => count($data['rows']),
	'online' => 0,
	'warning' => 0,
	'critical' => 0,
	'nodata' => 0,
	'maintenance' => 0
];
foreach ($data['rows'] as $row) {
	$summary['online'] += $row['availability'] === 'up' ? 1 : 0;
	if (array_key_exists($row['health'], $summary)) {
		$summary[$row['health']]++;
	}
}

$summary_labels = [
	'all' => $t('Total'),
	'online' => $t('En línea'),
	'warning' => $t('Advertencias'),
	'critical' => $t('Críticos'),
	'nodata' => $t('Sin datos'),
	'maintenance' => $t('Mantenimiento')
];
$summary_cards = (new CDiv())->addClass('sr-summary');
foreach ($summary_labels as $key => $label) {
	$filter = $key === 'online' ? 'availability-up' : $key;
	$summary_cards->addItem(
		(new CTag('button', true, [
			(new CSpan((string) $summary[$key]))->addClass('sr-summary-value'),
			(new CSpan($label))->addClass('sr-summary-label')
		]))
			->setAttribute('type', 'button')
			->setAttribute('data-filter', $filter)
			->addClass('sr-summary-card sr-summary-'.$key.($key === 'all' ? ' is-active' : ''))
	);
}
$root->addItem($summary_cards);

$filters = (new CDiv())->addClass('sr-quick-filters');
foreach ([
	'all' => $t('Todos'),
	'critical' => $t('Críticos'),
	'warning' => $t('Advertencias'),
	'nodata' => $t('Sin datos'),
	'maintenance' => $t('Mantenimiento'),
	'windows' => _('Windows'),
	'linux' => _('Linux')
] as $filter => $label) {
	$filters->addItem(
		(new CTag('button', true, $label))
			->setAttribute('type', 'button')
			->setAttribute('data-filter', $filter)
			->addClass('sr-filter'.($filter === 'all' ? ' is-active' : ''))
	);
}

$toolbar = (new CDiv([
	(new CDiv([
		(new CSpan('⌕'))->addClass('sr-search-icon'),
		$search
	]))->addClass('sr-search-wrap'),
	(new CSpan(count($data['rows']).' '.$t('servidores')))->addClass('sr-count'),
	$filters
]))->addClass('sr-toolbar');

$root->addItem($toolbar);

if (!$data['rows']) {
	$root->addItem(
		(new CDiv([
			(new CDiv('◫'))->addClass('sr-no-data-icon'),
			(new CDiv($t('No se encontraron servidores con métricas de Zabbix agent.')))->addClass('sr-no-data-title'),
			(new CDiv($t('Verifique el grupo seleccionado, los permisos y que la plantilla oficial esté vinculada.')))
				->addClass('sr-no-data-help')
		]))->addClass('sr-no-data')
	);
}
elseif ((int) $data['fields_values']['group_by_os'] === 1) {
	$groups = ['windows' => [], 'linux' => []];
	foreach ($data['rows'] as $row) {
		$groups[$row['os']][] = $row;
	}

	foreach ($groups as $os => $rows) {
		if (!$rows) {
			continue;
		}

		$root->addItem(
			(new CDiv([
				(new CDiv([
					(new CSpan($os === 'windows' ? '▦' : '●'))->addClass('sr-section-icon sr-os-'.$os),
					new CSpan($os === 'windows' ? $t('Servidores Windows') : $t('Servidores Linux')),
					(new CSpan(count($rows)))->addClass('sr-section-count')
				]))->addClass('sr-section-title'),
				(new CDiv($make_table($rows)))->addClass('sr-table-scroll')
			]))->addClass('sr-section')->setAttribute('data-os', $os)
		);
	}
}
else {
	$root->addItem((new CDiv($make_table($data['rows'])))->addClass('sr-table-scroll'));
}

$root->addItem(
	(new CDiv([
		(new CSpan('©LAKA Soluciones Tecnológicas'))
			->addClass('sr-copyright'),
		(new CSpan($t('Actualizado').': '.zbx_date2str(DATE_TIME_FORMAT_SECONDS, $data['generated_at'])))
			->addClass('sr-updated')
	]))->addClass('sr-footer')
);

(new CWidgetView($data))
	->addItem($root)
	->show();
