class CWidgetSystemResources extends CWidget {

	onInitialize() {
		super.onInitialize();

		this._content_click_handler = null;
		this._content_input_handler = null;
		this._history_overlay = null;
		this._history_request = null;
		this._host_overlay = null;
		this._host_request = null;
		this._host_resize_handler = null;
		this._active_filter = 'all';
		this._language = 'es';
		this._sort = {key: 'name', direction: 1};
		this._escape_handler = event => {
			if (event.key === 'Escape') {
				if (this._history_overlay !== null) {
					this._closeHistory();
				}
				else {
					this._closeHostDetails();
				}
			}
		};
	}

	hasPadding() {
		return false;
	}

	setContents(response) {
		super.setContents(response);
		this._language = this._body.querySelector('.sr-root')?.dataset.language || 'es';
		this._applyContrastTheme();
		this._wireContents();
		this._syncFilterButtons();
		this._applyFilters();
	}

	_t(text) {
		const translations = {
			en: {
				'servidor': 'server', 'servidores': 'servers', 'Detalle de': 'Details for', 'Cerrar': 'Close',
				'Cargando consola del servidor…': 'Loading server console…',
				'Recopilando recursos, red, servicios y problemas…': 'Collecting resources, network, services and problems…',
				'No fue posible cargar el host.': 'The host could not be loaded.',
				'Zabbix devolvió HTML. Verifique que el módulo nuevo esté habilitado.': 'Zabbix returned HTML. Check that the new module is enabled.',
				'Zabbix devolvió una respuesta no válida.': 'Zabbix returned an invalid response.',
				'Resumen': 'Summary', 'Discos': 'Disks', 'Red': 'Network', 'Servicios': 'Services',
				'Problemas': 'Problems', 'Rendimiento': 'Performance', 'RAM total': 'Total RAM',
				'Procesos': 'Processes', 'Problemas activos': 'Active problems', 'Sistema operativo': 'Operating system',
				'Nombre técnico': 'Technical name', 'Agente': 'Agent', 'Grupos': 'Groups',
				'Mantenimiento': 'Maintenance', 'Activo': 'Active', 'No': 'No',
				'Últimos datos en Zabbix': 'Latest data in Zabbix', 'Problemas en Zabbix': 'Problems in Zabbix',
				'No se encontraron sistemas de archivos descubiertos.': 'No discovered file systems were found.',
				'Unidad': 'Drive', 'Utilizado': 'Used', 'Usado': 'Used', 'Libre': 'Free', 'Total': 'Total',
				'Histórico': 'History', 'Ver gráfico': 'View chart',
				'No se encontraron ítems net.if.* para este host.': 'No net.if.* items were found for this host.',
				'Interfaz': 'Interface', 'Entrada': 'Inbound', 'Salida': 'Outbound', 'Velocidad': 'Speed',
				'Errores': 'Errors', 'Estado': 'Status', 'Monitoreada': 'Monitored',
				'No existen servicios descubiertos por la plantilla del host.': 'No services discovered by the host template were found.',
				'Servicio': 'Service', 'Último dato': 'Last data', 'En ejecución': 'Running', 'Detenido': 'Stopped',
				'✓ El servidor no tiene problemas activos.': '✓ The server has no active problems.',
				'Severidad': 'Severity', 'Problema': 'Problem', 'Duración': 'Duration', 'Reconocido': 'Acknowledged',
				'Suprimido': 'Suppressed', 'No clasificado': 'Not classified', 'Información': 'Information',
				'Advertencia': 'Warning', 'Promedio': 'Average', 'Alto': 'High', 'Desastre': 'Disaster',
				'Sí': 'Yes', 'Abrir lista completa de problemas': 'Open full problem list',
				'No hay ítems de CPU o RAM disponibles.': 'No CPU or RAM items are available.',
				'Comparación histórica de CPU y RAM': 'CPU and RAM historical comparison',
				'Cargando series de rendimiento…': 'Loading performance series…',
				'Alerta por espacio libre': 'Free-space alert', 'advertencia': 'warning', 'crítico': 'critical',
				'Partición pequeña, evaluación porcentual': 'Small partition, percentage evaluation',
				'Alerta porcentual': 'Percentage alert', 'Histórico': 'History',
				'Cargando información del ítem…': 'Loading item information…', 'Desde': 'From', 'Hasta': 'To',
				'Aplicar': 'Apply', 'Consultando histórico…': 'Loading history…',
				'El rango de fecha y hora no es válido.': 'The date and time range is invalid.',
				'Zabbix devolvió una página HTML. Verifique que el módulo esté actualizado y habilitado.': 'Zabbix returned an HTML page. Check that the module is current and enabled.',
				'La respuesta histórica de Zabbix no contiene JSON válido.': 'The Zabbix history response does not contain valid JSON.',
				'No fue posible obtener el histórico.': 'History data could not be retrieved.',
				'No existen datos históricos para el período seleccionado.': 'No historical data exists for the selected period.',
				'Último': 'Latest', 'Mínimo': 'Minimum', 'Máximo': 'Maximum',
				'Evolución histórica del espacio utilizado': 'Historical used-space trend',
				'Los períodos extensos se muestran con datos agregados de history/trends.': 'Long periods are shown using aggregated history/trends data.',
				'Estado actual de la memoria': 'Current memory status', 'Estado actual del procesador': 'Current processor status',
				'Uso actual': 'Current usage', 'RAM utilizada': 'RAM used', 'Procesadores lógicos': 'Logical processors',
				'Capacidad disponible': 'Available capacity', 'utilizado': 'used', 'Unidad de disco': 'Disk drive',
				'Disponible': 'Available', 'Valor': 'Value', 'No existen puntos para representar.': 'There are no points to display.',
				'Mueva el cursor para ver valores · arrastre para ampliar': 'Move the pointer to see values · drag to zoom',
				'Restablecer zoom': 'Reset zoom', 'Gráfico histórico interactivo': 'Interactive history chart'
			},
			pt_BR: {
				'servidor': 'servidor', 'servidores': 'servidores', 'Detalle de': 'Detalhes de', 'Cerrar': 'Fechar',
				'Cargando consola del servidor…': 'Carregando console do servidor…',
				'Recopilando recursos, red, servicios y problemas…': 'Coletando recursos, rede, serviços e problemas…',
				'No fue posible cargar el host.': 'Não foi possível carregar o host.',
				'Zabbix devolvió HTML. Verifique que el módulo nuevo esté habilitado.': 'O Zabbix retornou HTML. Verifique se o novo módulo está habilitado.',
				'Zabbix devolvió una respuesta no válida.': 'O Zabbix retornou uma resposta inválida.',
				'Resumen': 'Resumo', 'Discos': 'Discos', 'Red': 'Rede', 'Servicios': 'Serviços',
				'Problemas': 'Problemas', 'Rendimiento': 'Desempenho', 'RAM total': 'RAM total',
				'Procesos': 'Processos', 'Problemas activos': 'Problemas ativos', 'Sistema operativo': 'Sistema operacional',
				'Nombre técnico': 'Nome técnico', 'Agente': 'Agente', 'Grupos': 'Grupos',
				'Mantenimiento': 'Manutenção', 'Activo': 'Ativa', 'No': 'Não',
				'Últimos datos en Zabbix': 'Dados mais recentes no Zabbix', 'Problemas en Zabbix': 'Problemas no Zabbix',
				'No se encontraron sistemas de archivos descubiertos.': 'Nenhum sistema de arquivos descoberto foi encontrado.',
				'Unidad': 'Unidade', 'Utilizado': 'Utilizado', 'Usado': 'Usado', 'Libre': 'Livre', 'Total': 'Total',
				'Histórico': 'Histórico', 'Ver gráfico': 'Ver gráfico',
				'No se encontraron ítems net.if.* para este host.': 'Nenhum item net.if.* foi encontrado para este host.',
				'Interfaz': 'Interface', 'Entrada': 'Entrada', 'Salida': 'Saída', 'Velocidad': 'Velocidade',
				'Errores': 'Erros', 'Estado': 'Estado', 'Monitoreada': 'Monitorada',
				'No existen servicios descubiertos por la plantilla del host.': 'Não existem serviços descobertos pelo template do host.',
				'Servicio': 'Serviço', 'Último dato': 'Último dado', 'En ejecución': 'Em execução', 'Detenido': 'Parado',
				'✓ El servidor no tiene problemas activos.': '✓ O servidor não tem problemas ativos.',
				'Severidad': 'Severidade', 'Problema': 'Problema', 'Duración': 'Duração', 'Reconocido': 'Reconhecido',
				'Suprimido': 'Suprimido', 'No clasificado': 'Não classificado', 'Información': 'Informação',
				'Advertencia': 'Aviso', 'Promedio': 'Média', 'Alto': 'Alto', 'Desastre': 'Desastre',
				'Sí': 'Sim', 'Abrir lista completa de problemas': 'Abrir lista completa de problemas',
				'No hay ítems de CPU o RAM disponibles.': 'Não há itens de CPU ou RAM disponíveis.',
				'Comparación histórica de CPU y RAM': 'Comparação histórica de CPU e RAM',
				'Cargando series de rendimiento…': 'Carregando séries de desempenho…',
				'Alerta por espacio libre': 'Alerta por espaço livre', 'advertencia': 'aviso', 'crítico': 'crítico',
				'Partición pequeña, evaluación porcentual': 'Partição pequena, avaliação percentual',
				'Alerta porcentual': 'Alerta percentual', 'Cargando información del ítem…': 'Carregando informações do item…',
				'Desde': 'De', 'Hasta': 'Até', 'Aplicar': 'Aplicar', 'Consultando histórico…': 'Consultando histórico…',
				'El rango de fecha y hora no es válido.': 'O intervalo de data e hora não é válido.',
				'Zabbix devolvió una página HTML. Verifique que el módulo esté actualizado y habilitado.': 'O Zabbix retornou uma página HTML. Verifique se o módulo está atualizado e habilitado.',
				'La respuesta histórica de Zabbix no contiene JSON válido.': 'A resposta histórica do Zabbix não contém JSON válido.',
				'No fue posible obtener el histórico.': 'Não foi possível obter o histórico.',
				'No existen datos históricos para el período seleccionado.': 'Não existem dados históricos para o período selecionado.',
				'Último': 'Último', 'Mínimo': 'Mínimo', 'Máximo': 'Máximo',
				'Evolución histórica del espacio utilizado': 'Evolução histórica do espaço utilizado',
				'Los períodos extensos se muestran con datos agregados de history/trends.': 'Períodos extensos são exibidos com dados agregados de history/trends.',
				'Estado actual de la memoria': 'Estado atual da memória', 'Estado actual del procesador': 'Estado atual do processador',
				'Uso actual': 'Uso atual', 'RAM utilizada': 'RAM utilizada', 'Procesadores lógicos': 'Processadores lógicos',
				'Capacidad disponible': 'Capacidade disponível', 'utilizado': 'utilizado', 'Unidad de disco': 'Unidade de disco',
				'Disponible': 'Disponível', 'Valor': 'Valor', 'No existen puntos para representar.': 'Não existem pontos para exibir.',
				'Mueva el cursor para ver valores · arrastre para ampliar': 'Mova o cursor para ver valores · arraste para ampliar',
				'Restablecer zoom': 'Redefinir zoom', 'Gráfico histórico interactivo': 'Gráfico histórico interativo'
			}
		};

		return translations[this._language]?.[text] || text;
	}

	_locale() {
		return {es: 'es-BO', en: 'en-US', pt_BR: 'pt-BR'}[this._language] || 'es-BO';
	}

	_applyContrastTheme() {
		const root = this._body.querySelector('.sr-root');
		if (root === null) {
			return;
		}

		root.classList.toggle('sr-theme-dark', this._hasDarkBackground(root));
	}

	_hasDarkBackground(element) {
		let current = element;

		while (current !== null) {
			const color = getComputedStyle(current).backgroundColor;
			const match = color.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)(?:\D+([\d.]+))?/);

			if (match !== null && (match[4] === undefined || Number(match[4]) > 0)) {
				const red = Number(match[1]);
				const green = Number(match[2]);
				const blue = Number(match[3]);
				const luminance = .2126 * red + .7152 * green + .0722 * blue;

				return luminance < 135;
			}

			current = current.parentElement;
		}

		return false;
	}

	onClearContents() {
		this._closeHistory();
		this._closeHostDetails();
		super.onClearContents();
	}

	_wireContents() {
		if (this._content_click_handler !== null) {
			this._body.removeEventListener('click', this._content_click_handler);
			this._body.removeEventListener('input', this._content_input_handler);
		}

		this._content_click_handler = event => {
			const metric = event.target.closest('.sr-metric');
			if (metric !== null && this._body.contains(metric)) {
				event.preventDefault();
				this._openHistory(metric);
				return;
			}

			const host = event.target.closest('.sr-host-open');
			if (host !== null && this._body.contains(host)) {
				event.preventDefault();
				this._openHostDetails(host.dataset.hostid, host.textContent.trim());
				return;
			}

			const filter = event.target.closest('[data-filter]');
			if (filter !== null && this._body.contains(filter)) {
				event.preventDefault();
				this._active_filter = filter.dataset.filter || 'all';
				this._syncFilterButtons();
				this._applyFilters();
				return;
			}

			const sort = event.target.closest('.sr-sort');
			if (sort !== null && this._body.contains(sort)) {
				event.preventDefault();
				this._sortRows(sort.dataset.sortKey, sort);
			}
		};

		this._content_input_handler = event => {
			if (event.target.matches('.sr-search')) {
				this._applyFilters();
			}
		};

		this._body.addEventListener('click', this._content_click_handler);
		this._body.addEventListener('input', this._content_input_handler);
	}

	_applyFilters() {
		const query = this._body.querySelector('.sr-search')?.value || '';
		const normalized = query.trim().toLocaleLowerCase();
		let visible = 0;

		for (const row of this._body.querySelectorAll('.sr-host-row')) {
			const matches_text = normalized === '' || row.textContent.toLocaleLowerCase().includes(normalized);
			const filter = this._active_filter;
			const matches_filter = filter === 'all'
				|| (filter === 'availability-up' && row.classList.contains('sr-host-up'))
				|| (filter === 'windows' && row.classList.contains('sr-host-windows'))
				|| (filter === 'linux' && row.classList.contains('sr-host-linux'))
				|| row.classList.contains(`sr-health-${filter}`);
			const matches = matches_text && matches_filter;
			row.hidden = !matches;
			visible += matches ? 1 : 0;
		}

		for (const section of this._body.querySelectorAll('.sr-section')) {
			const section_visible = section.querySelectorAll('.sr-host-row:not([hidden])').length;
			section.hidden = section_visible === 0;
			const section_counter = section.querySelector('.sr-section-count');
			if (section_counter !== null) {
				section_counter.textContent = String(section_visible);
			}
		}

		const counter = this._body.querySelector('.sr-count');
		if (counter !== null) {
			counter.textContent = `${visible} ${this._t(visible === 1 ? 'servidor' : 'servidores')}`;
		}
	}

	_syncFilterButtons() {
		for (const button of this._body.querySelectorAll('[data-filter]')) {
			button.classList.toggle('is-active', button.dataset.filter === this._active_filter);
		}
	}

	_sortRows(key, button) {
		if (!key) {
			return;
		}

		this._sort.direction = this._sort.key === key ? -this._sort.direction : 1;
		this._sort.key = key;
		for (const current of this._body.querySelectorAll('.sr-sort')) {
			current.classList.toggle('is-active', current === button);
			const icon = current.querySelector('.sr-sort-icon');
			if (icon !== null) {
				icon.textContent = current === button ? (this._sort.direction === 1 ? '↑' : '↓') : '↕';
			}
		}

		const selector = {
			health: '.sr-status',
			name: '.sr-host-open',
			cpu: 'td:nth-child(3) [data-sort-value]',
			vcpu: 'td:nth-child(4) [data-sort-value]',
			ram: 'td:nth-child(5) [data-sort-value]',
			memory: 'td:nth-child(6) [data-sort-value]',
			disk: '.sr-disks',
			problems: '.sr-problems',
			uptime: 'td:nth-child(10) [data-sort-value]'
		}[key];

		for (const tbody of this._body.querySelectorAll('.sr-table tbody')) {
			const rows = [...tbody.querySelectorAll('.sr-host-row')];
			rows.sort((a, b) => {
				const av = a.querySelector(selector)?.dataset.sortValue ?? '';
				const bv = b.querySelector(selector)?.dataset.sortValue ?? '';
				const an = Number(av);
				const bn = Number(bv);
				const result = Number.isFinite(an) && Number.isFinite(bn)
					? an - bn
					: av.localeCompare(bv, undefined, {numeric: true, sensitivity: 'base'});
				return result * this._sort.direction;
			});
			tbody.append(...rows);
		}
	}

	_openHostDetails(hostid, host_name) {
		this._closeHostDetails();

		const overlay = document.createElement('div');
		overlay.className = 'sr-host-overlay';
		const dialog = document.createElement('section');
		dialog.className = 'sr-host-dialog';
		dialog.setAttribute('role', 'dialog');
		dialog.setAttribute('aria-modal', 'true');
		dialog.setAttribute('aria-label', `${this._t('Detalle de')} ${host_name}`);
		const widget_root = this._body.querySelector('.sr-root');
		dialog.classList.toggle('sr-theme-dark', widget_root?.classList.contains('sr-theme-dark') === true);
		const disk_alert = {
			mode: Number(widget_root?.dataset.diskAlertMode ?? 0),
			warnFreeGb: Number(widget_root?.dataset.diskWarnFreeGb ?? 20),
			critFreeGb: Number(widget_root?.dataset.diskCritFreeGb ?? 10),
			warnPercent: Number(widget_root?.dataset.diskWarnPercent ?? 75),
			critPercent: Number(widget_root?.dataset.diskCritPercent ?? 90)
		};

		const header = document.createElement('header');
		header.className = 'sr-host-header';
		const heading = document.createElement('div');
		heading.className = 'sr-host-heading';
		const title = document.createElement('strong');
		title.textContent = host_name;
		const subtitle = document.createElement('span');
		subtitle.textContent = this._t('Cargando consola del servidor…');
		heading.append(title, subtitle);
		const close = document.createElement('button');
		close.type = 'button';
		close.className = 'sr-host-close';
		close.setAttribute('aria-label', this._t('Cerrar'));
		close.textContent = '×';
		close.addEventListener('click', () => this._closeHostDetails());
		header.append(heading, close);

		const body = document.createElement('div');
		body.className = 'sr-host-body';
		body.append(this._message('sr-host-loading', this._t('Recopilando recursos, red, servicios y problemas…')));
		dialog.append(header, body);
		overlay.append(dialog);
		overlay.addEventListener('mousedown', event => {
			if (event.target === overlay) {
				this._closeHostDetails();
			}
		});
		overlay.addEventListener('click', event => {
			const metric = event.target.closest('.sr-metric');
			if (metric !== null) {
				event.preventDefault();
				this._openHistory(metric);
				return;
			}
			const tab = event.target.closest('.sr-host-tab');
			if (tab !== null) {
				this._activateHostTab(dialog, tab.dataset.tab);
			}
		});

		document.documentElement.append(overlay);
		this._host_resize_handler = () => this._fitHostDialog(overlay, dialog);
		this._fitHostDialog(overlay, dialog);
		window.addEventListener('resize', this._host_resize_handler);
		document.addEventListener('keydown', this._escape_handler);
		this._host_overlay = overlay;
		close.focus();

		const controller = new AbortController();
		this._host_request = controller;
		this._requestJson('widget.systemresources.hostdetails', {hostid}, controller.signal)
			.then(data => {
				if (data.error) {
					throw new Error((data.error.messages || [this._t('No fue posible cargar el host.')]).join(' '));
				}
				if (this._host_overlay !== overlay) {
					return;
				}
				title.textContent = data.host.name;
				data.disk_alert = disk_alert;
				subtitle.textContent = [data.host.address, data.host.agent_version ? `Agent ${data.host.agent_version}` : '']
					.filter(Boolean).join(' · ');
				this._renderHostDetails(body, data);
			})
			.catch(error => {
				if (error.name !== 'AbortError' && this._host_overlay === overlay) {
					body.replaceChildren(this._message('sr-host-error', error.message));
				}
			})
			.finally(() => {
				if (this._host_request === controller) {
					this._host_request = null;
				}
			});
	}

	_fitHostDialog(overlay, dialog) {
		const viewport_width = document.documentElement.clientWidth || window.innerWidth;
		const viewport_height = document.documentElement.clientHeight || window.innerHeight;
		const gutter = viewport_width <= 760 ? 16 : 32;

		overlay.style.width = `${viewport_width}px`;
		overlay.style.height = `${viewport_height}px`;
		dialog.style.width = `${Math.max(1, Math.min(1180, viewport_width - gutter))}px`;
		dialog.style.height = `${Math.max(1, Math.min(760, viewport_height - gutter))}px`;
	}

	_requestJson(action, parameters, signal = undefined) {
		const url = new Curl('zabbix.php');
		url.setArgument('action', action);
		return fetch(url.getUrl(), {
			method: 'POST',
			headers: {'Accept': 'application/json'},
			body: new URLSearchParams(Object.fromEntries(
				Object.entries(parameters).map(([key, value]) => [key, String(value)])
			)),
			credentials: 'same-origin',
			signal
		}).then(async response => {
			const payload = await response.text();
			let data;
			try {
				data = JSON.parse(payload);
			}
			catch (error) {
				throw new Error(/^\s*</.test(payload)
					? this._t('Zabbix devolvió HTML. Verifique que el módulo nuevo esté habilitado.')
					: this._t('Zabbix devolvió una respuesta no válida.')
				);
			}
			if (!response.ok) {
				throw new Error(data?.error?.messages?.join(' ') || `HTTP ${response.status}`);
			}
			return data;
		});
	}

	_renderHostDetails(body, data) {
		body.replaceChildren();
		const navigation = document.createElement('nav');
		navigation.className = 'sr-host-tabs';
		const panels = document.createElement('div');
		panels.className = 'sr-host-panels';
		const definitions = [
			['summary', this._t('Resumen'), () => this._hostSummaryPanel(data)],
			['disks', `${this._t('Discos')} (${data.disks.length})`, () => this._hostDisksPanel(data)],
			['network', `${this._t('Red')} (${data.interfaces.length})`, () => this._hostNetworkPanel(data)],
			['services', `${this._t('Servicios')} (${data.services.length})`, () => this._hostServicesPanel(data)],
			['problems', `${this._t('Problemas')} (${data.problems.length})`, () => this._hostProblemsPanel(data)],
			['performance', this._t('Rendimiento'), () => this._hostPerformancePanel(data)]
		];

		for (const [key, label, factory] of definitions) {
			const tab = document.createElement('button');
			tab.type = 'button';
			tab.className = `sr-host-tab${key === 'summary' ? ' is-active' : ''}`;
			tab.dataset.tab = key;
			tab.textContent = label;
			navigation.append(tab);
			const panel = factory();
			panel.classList.add('sr-host-panel');
			panel.dataset.panel = key;
			panel.hidden = key !== 'summary';
			panels.append(panel);
		}

		body.append(navigation, panels);
	}

	_activateHostTab(dialog, key) {
		for (const tab of dialog.querySelectorAll('.sr-host-tab')) {
			tab.classList.toggle('is-active', tab.dataset.tab === key);
		}
		for (const panel of dialog.querySelectorAll('.sr-host-panel')) {
			panel.hidden = panel.dataset.panel !== key;
		}
	}

	_hostSummaryPanel(data) {
		const panel = document.createElement('section');
		const grid = document.createElement('div');
		grid.className = 'sr-detail-grid';
		const host = data.host;
		for (const [label, value, metric] of [
			['CPU', host.cpu ? this._formatValue(host.cpu.value, host.cpu.units) : '—', host.cpu],
			['RAM', host.ram ? this._formatValue(host.ram.value, host.ram.units) : '—', host.ram],
			[this._t('RAM total'), host.memory_total ? this._formatValue(host.memory_total.value, 'B') : '—', host.memory_total],
			[this._t('Procesos'), host.processes?.value ?? '—', host.processes],
			['Uptime', host.uptime ? this._formatValue(host.uptime.value, 'uptime') : '—', host.uptime],
			[this._t('Problemas activos'), String(data.problems.length), null]
		]) {
			grid.append(this._detailCard(label, value, metric));
		}

		const information = document.createElement('div');
		information.className = 'sr-host-information';
		for (const [label, value] of [
			[this._t('Sistema operativo'), host.os],
			['IP / DNS', host.address || '—'],
			[this._t('Nombre técnico'), host.technical_name],
			[this._t('Agente'), host.agent_version || '—'],
			[this._t('Grupos'), host.groups.join(', ') || '—'],
			[this._t('Mantenimiento'), host.maintenance ? this._t('Activo') : this._t('No')]
		]) {
			const row = document.createElement('div');
			row.append(this._element('span', '', label), this._element('strong', '', value));
			information.append(row);
		}

		const links = document.createElement('div');
		links.className = 'sr-host-links';
		links.append(
			this._externalLink(this._t('Últimos datos en Zabbix'), data.urls.latest),
			this._externalLink(this._t('Problemas en Zabbix'), data.urls.problems)
		);
		panel.append(grid, information, links);
		return panel;
	}

	_detailCard(label, value, metric = null) {
		const card = document.createElement(metric ? 'button' : 'div');
		card.className = `sr-detail-card${metric ? ' sr-metric' : ''}`;
		if (metric) {
			card.type = 'button';
			card.dataset.itemid = metric.itemid;
			card.dataset.title = metric.name;
		}
		card.append(this._element('span', '', label), this._element('strong', '', value));
		return card;
	}

	_hostDisksPanel(data) {
		const panel = document.createElement('section');
		if (!data.disks.length) {
			panel.append(this._message('sr-panel-empty', this._t('No se encontraron sistemas de archivos descubiertos.')));
			return panel;
		}
		const table = this._detailTable(['Unidad', 'Utilizado', 'Usado', 'Libre', 'Total', 'Histórico'].map(label => this._t(label)));
		for (const disk of data.disks) {
			const current = disk.current;
			const metric = disk.pused || disk.used || null;
			const level = this._diskLevel(current, data.disk_alert);
			const alert_description = this._diskAlertDescription(current, data.disk_alert);
			const history = metric ? this._metricAction(metric, this._t('Ver gráfico'), {
				resourceType: 'disk', diskLabel: disk.filesystem,
				currentPused: current.pused, currentUsed: current.used,
				currentFree: current.free, currentTotal: current.total,
				level
			}) : this._element('span', '', '—');
			const bar = document.createElement('div');
			bar.className = `sr-detail-disk-bar sr-level-${level}`;
			bar.title = alert_description;
			bar.style.setProperty('--sr-percent', `${Math.max(0, Math.min(100, Number(current.pused) || 0))}%`);
			bar.append(this._element('strong', '', current.pused === null ? '—' : `${Number(current.pused).toFixed(1)}%`));
			this._appendDetailRow(table, [
				disk.filesystem, bar,
				this._formatValue(current.used, 'B'), this._formatValue(current.free, 'B'),
				this._formatValue(current.total, 'B'), history
			]);
		}
		panel.append(table);
		return panel;
	}

	_hostNetworkPanel(data) {
		const panel = document.createElement('section');
		if (!data.interfaces.length) {
			panel.append(this._message('sr-panel-empty', this._t('No se encontraron ítems net.if.* para este host.')));
			return panel;
		}
		const table = this._detailTable(['Interfaz', 'Entrada', 'Salida', 'Velocidad', 'Errores', 'Estado'].map(label => this._t(label)));
		for (const item of data.interfaces) {
			const metric = key => item.metrics[key]
				? this._metricAction(item.metrics[key], this._formatValue(item.metrics[key].value, item.metrics[key].units))
				: '—';
			const error_parts = [];
			for (const [label, key] of [['E', 'errors_in'], ['S', 'errors_out'], ['', 'errors']]) {
				if (item.metrics[key]) {
					error_parts.push(`${label ? `${label}: ` : ''}${this._formatValue(item.metrics[key].value, item.metrics[key].units)}`);
				}
			}
			this._appendDetailRow(table, [
				item.name, metric('in'), metric('out'), metric('speed'), error_parts.join(' / ') || '—',
				item.metrics.status?.value ?? this._t('Monitoreada')
			]);
		}
		panel.append(table);
		return panel;
	}

	_hostServicesPanel(data) {
		const panel = document.createElement('section');
		if (!data.services.length) {
			panel.append(this._message('sr-panel-empty', this._t('No existen servicios descubiertos por la plantilla del host.')));
			return panel;
		}
		const table = this._detailTable(['Servicio', 'Estado', 'Último dato'].map(label => this._t(label)));
		for (const service of data.services) {
			const status = this._element('span', `sr-service-state sr-service-${service.status}`,
				service.status === 'running' ? this._t('En ejecución') : (service.status === 'stopped' ? this._t('Detenido') : String(service.value))
			);
			this._appendDetailRow(table, [service.name, status, this._formatClock(service.lastclock)]);
		}
		panel.append(table);
		return panel;
	}

	_hostProblemsPanel(data) {
		const panel = document.createElement('section');
		if (!data.problems.length) {
			panel.append(this._message('sr-panel-empty sr-panel-ok', this._t('✓ El servidor no tiene problemas activos.')));
			return panel;
		}
		const table = this._detailTable(['Severidad', 'Problema', 'Duración', 'Reconocido', 'Suprimido'].map(label => this._t(label)));
		for (const problem of data.problems) {
			const severity = Number(problem.severity);
			const labels = ['No clasificado', 'Información', 'Advertencia', 'Promedio', 'Alto', 'Desastre'].map(label => this._t(label));
			const badge = this._element('span', `sr-severity sr-severity-${severity}`, labels[severity] || labels[0]);
			const duration = this._formatDuration(Math.max(0, Math.floor(Date.now() / 1000) - Number(problem.clock)));
			this._appendDetailRow(table, [
				badge, problem.name, duration,
				String(problem.acknowledged) === '1' ? this._t('Sí') : this._t('No'),
				String(problem.suppressed) === '1' ? this._t('Sí') : this._t('No')
			]);
		}
		panel.append(table, this._externalLink(this._t('Abrir lista completa de problemas'), data.urls.problems));
		return panel;
	}

	_hostPerformancePanel(data) {
		const panel = document.createElement('section');
		const metrics = [['CPU', data.host.cpu, '#00a88f'], ['RAM', data.host.ram, '#3b82f6']]
			.filter(([, metric]) => metric !== null);
		if (!metrics.length) {
			panel.append(this._message('sr-panel-empty', this._t('No hay ítems de CPU o RAM disponibles.')));
			return panel;
		}
		const heading = this._element('div', 'sr-performance-heading', this._t('Comparación histórica de CPU y RAM'));
		const ranges = document.createElement('div');
		ranges.className = 'sr-performance-ranges';
		const holder = document.createElement('div');
		holder.className = 'sr-performance-chart';
		const load = (seconds, selected) => {
			for (const button of ranges.querySelectorAll('button')) {
				button.classList.toggle('is-active', button === selected);
			}
			holder.replaceChildren(this._message('sr-host-loading', this._t('Cargando series de rendimiento…')));
			const now = Math.floor(Date.now() / 1000);
			Promise.all(metrics.map(([name, metric, color]) =>
				this._requestJson('widget.systemresources.history', {
					itemid: metric.itemid, time_from: now - seconds, time_to: now
				}).then(result => {
					if (result.error) throw new Error((result.error.messages || []).join(' '));
					return {name, color, points: result.points || []};
				})
			)).then(series => {
				if (panel.isConnected) holder.replaceChildren(this._createMultiChart(series, '%'));
			}).catch(error => {
				if (panel.isConnected) holder.replaceChildren(this._message('sr-host-error', error.message));
			});
		};
		for (const [label, seconds] of [['1 h', 3600], ['6 h', 21600], ['24 h', 86400], ['7 d', 604800], ['30 d', 2592000]]) {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			button.addEventListener('click', () => load(seconds, button));
			ranges.append(button);
		}
		panel.append(heading, ranges, holder);
		const default_button = ranges.querySelectorAll('button')[2];
		load(86400, default_button);
		return panel;
	}

	_metricAction(metric, label, dataset = {}) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'sr-inline-metric sr-metric';
		button.textContent = label;
		button.dataset.itemid = metric.itemid;
		button.dataset.title = metric.name;
		for (const [key, value] of Object.entries(dataset)) {
			if (value !== null && value !== undefined) {
				button.dataset[key] = String(value);
			}
		}
		return button;
	}

	_detailTable(headers) {
		const table = document.createElement('table');
		table.className = 'sr-detail-table';
		const thead = table.createTHead();
		const row = thead.insertRow();
		for (const header of headers) {
			const th = document.createElement('th');
			th.textContent = header;
			row.append(th);
		}
		table.createTBody();
		return table;
	}

	_appendDetailRow(table, values) {
		const row = table.tBodies[0].insertRow();
		for (const value of values) {
			const cell = row.insertCell();
			cell.append(value instanceof Node ? value : document.createTextNode(String(value)));
		}
	}

	_externalLink(label, url) {
		const link = document.createElement('a');
		link.className = 'sr-external-link';
		link.href = url;
		link.textContent = label;
		return link;
	}

	_element(tag, class_name = '', text = '') {
		const element = document.createElement(tag);
		element.className = class_name;
		element.textContent = text;
		return element;
	}

	_diskLevel(current, config = {}) {
		const pused = current?.pused === null || current?.pused === '' ? NaN : Number(current?.pused);
		const free = current?.free === null || current?.free === '' ? NaN : Number(current?.free);
		const total = current?.total === null || current?.total === '' ? NaN : Number(current?.total);
		const warn_free = Math.max(Number(config.warnFreeGb) || 20, Number(config.critFreeGb) || 10);
		const crit_free = Math.min(Number(config.warnFreeGb) || 20, Number(config.critFreeGb) || 10);

		if (Number(config.mode) === 0 && Number.isFinite(free) && Number.isFinite(total)
				&& total / 1073741824 >= warn_free) {
			const free_gb = free / 1073741824;
			if (free_gb < crit_free) return 'critical';
			if (free_gb < warn_free) return 'warning';
			return 'ok';
		}

		if (!Number.isFinite(pused)) return 'none';
		const warn_percent = Math.min(Number(config.warnPercent) || 75, Number(config.critPercent) || 90);
		const crit_percent = Math.max(Number(config.warnPercent) || 75, Number(config.critPercent) || 90);
		if (pused >= crit_percent) return 'critical';
		if (pused >= warn_percent) return 'warning';
		return 'ok';
	}

	_diskAlertDescription(current, config = {}) {
		const total = current?.total === null || current?.total === '' ? NaN : Number(current?.total);
		const warn_free = Math.max(Number(config.warnFreeGb) || 20, Number(config.critFreeGb) || 10);
		const crit_free = Math.min(Number(config.warnFreeGb) || 20, Number(config.critFreeGb) || 10);

		if (Number(config.mode) === 0 && Number.isFinite(total) && total / 1073741824 >= warn_free) {
			return `${this._t('Alerta por espacio libre')}: ${this._t('advertencia')} < ${warn_free} GB · ${this._t('crítico')} < ${crit_free} GB`;
		}

		const warn_percent = Math.min(Number(config.warnPercent) || 75, Number(config.critPercent) || 90);
		const crit_percent = Math.max(Number(config.warnPercent) || 75, Number(config.critPercent) || 90);
		return `${this._t(Number(config.mode) === 0 ? 'Partición pequeña, evaluación porcentual' : 'Alerta porcentual')}: `
			+ `${this._t('advertencia')} ≥ ${warn_percent}% · ${this._t('crítico')} ≥ ${crit_percent}%`;
	}

	_formatDuration(seconds) {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor(seconds % 86400 / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);
		return days > 0 ? `${days}d ${hours}h` : (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
	}

	_openHistory(metric) {
		this._closeHistory();

		const itemid = metric.dataset.itemid;
		const requested_title = metric.dataset.title || this._t('Histórico');
		const metric_context = this._getMetricContext(metric);
		const overlay = document.createElement('div');
		overlay.className = 'sr-history-overlay';
		overlay.setAttribute('role', 'presentation');

		const dialog = document.createElement('section');
		dialog.className = 'sr-history-dialog';
		dialog.setAttribute('role', 'dialog');
		dialog.setAttribute('aria-modal', 'true');
		dialog.setAttribute('aria-label', requested_title);
		const widget_root = this._body.querySelector('.sr-root');
		dialog.classList.toggle('sr-theme-dark', widget_root?.classList.contains('sr-theme-dark') === true);

		const header = document.createElement('header');
		header.className = 'sr-history-header';

		const title_wrap = document.createElement('div');
		title_wrap.className = 'sr-history-title-wrap';
		const title = document.createElement('div');
		title.className = 'sr-history-title';
		title.textContent = requested_title;
		const subtitle = document.createElement('div');
		subtitle.className = 'sr-history-subtitle';
		subtitle.textContent = this._t('Cargando información del ítem…');
		title_wrap.append(title, subtitle);

		const close = document.createElement('button');
		close.type = 'button';
		close.className = 'sr-history-close';
		close.setAttribute('aria-label', this._t('Cerrar'));
		close.textContent = '×';
		close.addEventListener('click', () => this._closeHistory());
		header.append(title_wrap, close);

		const controls = document.createElement('div');
		controls.className = 'sr-history-controls';
		const from = this._makeDateField(this._t('Desde'));
		const to = this._makeDateField(this._t('Hasta'));
		controls.append(from.wrapper, to.wrapper);

		const presets = document.createElement('div');
		presets.className = 'sr-history-presets';
		for (const [label, seconds] of [['1 h', 3600], ['6 h', 21600], ['24 h', 86400], ['7 d', 604800], ['30 d', 2592000]]) {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			button.addEventListener('click', () => {
				const now = Math.floor(Date.now() / 1000);
				from.input.value = this._toLocalDateTime(now - seconds);
				to.input.value = this._toLocalDateTime(now);
				this._loadHistory(itemid, from.input, to.input, subtitle, metric_context);
			});
			presets.append(button);
		}
		controls.append(presets);

		const apply = document.createElement('button');
		apply.type = 'button';
		apply.className = 'sr-history-apply';
		apply.textContent = this._t('Aplicar');
		apply.addEventListener('click', () =>
			this._loadHistory(itemid, from.input, to.input, subtitle, metric_context)
		);
		controls.append(apply);

		const body = document.createElement('div');
		body.className = 'sr-history-body';
		body.append(this._message('sr-history-loading', this._t('Consultando histórico…')));

		dialog.append(header, controls, body);
		overlay.append(dialog);
		overlay.addEventListener('mousedown', event => {
			if (event.target === overlay) {
				this._closeHistory();
			}
		});

		const now = Math.floor(Date.now() / 1000);
		from.input.value = this._toLocalDateTime(now - 86400);
		to.input.value = this._toLocalDateTime(now);

		document.body.append(overlay);
		document.addEventListener('keydown', this._escape_handler);
		this._history_overlay = overlay;
		close.focus();
		this._loadHistory(itemid, from.input, to.input, subtitle, metric_context);
	}

	_getMetricContext(metric) {
		const number_or_null = value => {
			if (value === undefined || value === '') {
				return null;
			}

			const number = Number(value);
			return Number.isFinite(number) ? number : null;
		};

		return {
			type: metric.dataset.resourceType || 'metric',
			label: metric.dataset.diskLabel || '',
			level: metric.dataset.level || 'ok',
			pused: number_or_null(metric.dataset.currentPused),
			used: number_or_null(metric.dataset.currentUsed),
			free: number_or_null(metric.dataset.currentFree),
			total: number_or_null(metric.dataset.currentTotal)
		};
	}

	_makeDateField(label_text) {
		const wrapper = document.createElement('label');
		wrapper.className = 'sr-history-field';
		const label = document.createElement('span');
		label.textContent = label_text;
		const input = document.createElement('input');
		input.type = 'datetime-local';
		input.step = '60';
		wrapper.append(label, input);

		return {wrapper, input};
	}

	_loadHistory(itemid, from_input, to_input, subtitle, metric_context) {
		const time_from = Math.floor(new Date(from_input.value).getTime() / 1000);
		const time_to = Math.floor(new Date(to_input.value).getTime() / 1000);
		const body = this._history_overlay?.querySelector('.sr-history-body');

		if (body === null || body === undefined) {
			return;
		}

		if (!Number.isFinite(time_from) || !Number.isFinite(time_to) || time_from >= time_to) {
			body.replaceChildren(this._message('sr-history-error', this._t('El rango de fecha y hora no es válido.')));
			return;
		}

		if (this._history_request !== null) {
			this._history_request.abort();
		}

		const controller = new AbortController();
		this._history_request = controller;
		body.replaceChildren(this._message('sr-history-loading', this._t('Consultando histórico…')));

		const url = new Curl('zabbix.php');
		url.setArgument('action', 'widget.systemresources.history');

		const request = new URLSearchParams({
			itemid,
			time_from: String(time_from),
			time_to: String(time_to)
		});

		fetch(url.getUrl(), {
			method: 'POST',
			headers: {
				'Accept': 'application/json'
			},
			body: request,
			credentials: 'same-origin',
			signal: controller.signal
		})
			.then(async response => {
				const payload = await response.text();
				let data;

				try {
					data = JSON.parse(payload);
				}
				catch (error) {
					const is_html = /^\s*</.test(payload);
					throw new Error(is_html
						? this._t('Zabbix devolvió una página HTML. Verifique que el módulo esté actualizado y habilitado.')
						: this._t('La respuesta histórica de Zabbix no contiene JSON válido.')
					);
				}

				if (!response.ok) {
					const message = data?.error?.messages?.join(' ') || `HTTP ${response.status}`;
					throw new Error(message);
				}

				return data;
			})
			.then(data => {
				if (data.error) {
					throw new Error((data.error.messages || [this._t('No fue posible obtener el histórico.')]).join(' '));
				}
				if (this._history_overlay === null) {
					return;
				}

				subtitle.textContent = [data.host, data.name, data.key].filter(Boolean).join(' · ');
				this._renderHistory(body, data, metric_context);
			})
			.catch(error => {
				if (error.name !== 'AbortError' && this._history_overlay !== null) {
					body.replaceChildren(this._message('sr-history-error', error.message));
				}
			})
			.finally(() => {
				if (this._history_request === controller) {
					this._history_request = null;
				}
			});
	}

	_renderHistory(body, data, metric_context) {
		body.replaceChildren();

		if (metric_context.type === 'disk') {
			body.append(this._createDiskOverview(metric_context, data));
		}
		else if (metric_context.type === 'ram' || metric_context.type === 'cpu') {
			body.append(this._createResourceOverview(metric_context, data));
		}

		if (!Array.isArray(data.points) || data.points.length === 0) {
			const empty = this._message('sr-history-empty', this._t('No existen datos históricos para el período seleccionado.'));
			if (metric_context.type === 'disk') {
				empty.classList.add('sr-history-empty-compact');
			}
			body.append(empty);
			return;
		}

		if (data.stats !== null) {
			const stats = document.createElement('div');
			stats.className = 'sr-history-stats';
			for (const [label, key] of [['Último', 'last'], ['Promedio', 'avg'], ['Mínimo', 'min'], ['Máximo', 'max']]) {
				const card = document.createElement('div');
				card.className = 'sr-history-stat';
				const name = document.createElement('div');
				name.className = 'sr-history-stat-label';
				name.textContent = this._t(label);
				const value = document.createElement('div');
				value.className = 'sr-history-stat-value';
				value.textContent = this._formatValue(data.stats[key], data.units);
				card.append(name, value);
				stats.append(card);
			}
			body.append(stats);
		}

		if (metric_context.type === 'disk') {
			const heading = document.createElement('div');
			heading.className = 'sr-history-section-title';
			heading.textContent = this._t('Evolución histórica del espacio utilizado');
			body.append(heading);
		}

		body.append(this._createSvgChart(data.points, data.units));
		const note = document.createElement('div');
		note.className = 'sr-history-note';
		note.textContent = this._t('Los períodos extensos se muestran con datos agregados de history/trends.');
		body.append(note);
	}

	_createResourceOverview(context, data) {
		let percent = context.pused;
		if (percent === null && data.units === '%' && data.stats !== null) {
			percent = Number(data.stats.last);
		}
		percent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : null;

		const overview = document.createElement('section');
		overview.className = `sr-resource-overview sr-resource-${context.type}`;
		const heading = document.createElement('div');
		heading.className = 'sr-resource-overview-heading';
		heading.append(
			this._element('span', '', this._t(context.type === 'ram' ? 'Estado actual de la memoria' : 'Estado actual del procesador')),
			this._element('strong', '', percent === null ? '—' : `${percent.toLocaleString(this._locale(), {maximumFractionDigits: 1})}%`)
		);

		const values = document.createElement('div');
		values.className = 'sr-resource-values';
		if (context.type === 'ram') {
			const used = context.total !== null && percent !== null ? context.total * percent / 100 : null;
			for (const [label, value] of [
				[this._t('Uso actual'), percent === null ? '—' : `${percent.toFixed(1)}%`],
				[this._t('RAM utilizada'), this._formatValue(used, 'B')],
				[this._t('RAM total'), this._formatValue(context.total, 'B')]
			]) {
				values.append(this._resourceValue(label, value));
			}
		}
		else {
			for (const [label, value] of [
				[this._t('Uso actual'), percent === null ? '—' : `${percent.toFixed(1)}%`],
				[this._t('Procesadores lógicos'), context.total === null ? '—' : Number(context.total).toLocaleString(this._locale())],
				[this._t('Capacidad disponible'), percent === null ? '—' : `${(100 - percent).toFixed(1)}%`]
			]) {
				values.append(this._resourceValue(label, value));
			}
		}

		overview.append(heading, values);
		return overview;
	}

	_resourceValue(label, value) {
		const card = document.createElement('div');
		card.append(this._element('span', '', label), this._element('strong', '', value));
		return card;
	}

	_createDiskOverview(context, data) {
		let percent = context.pused;
		if (percent === null && data.units === '%' && data.stats !== null) {
			percent = Number(data.stats.last);
		}
		percent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : null;

		let total = context.total;
		let used = context.used;
		let free = context.free;
		if (used === null && total !== null && free !== null) {
			used = Math.max(0, total - free);
		}
		if (free === null && total !== null && used !== null) {
			free = Math.max(0, total - used);
		}
		if (used === null && total !== null && percent !== null) {
			used = total * percent / 100;
		}
		if (free === null && total !== null && percent !== null) {
			free = total * (100 - percent) / 100;
		}

		const overview = document.createElement('section');
		overview.className = `sr-disk-overview sr-disk-level-${context.level}`;

		const donut = document.createElement('div');
		donut.className = `sr-disk-donut sr-donut-${context.level}`;
		donut.style.setProperty('--sr-used-angle', `${(percent ?? 0) * 3.6}deg`);

		const donut_center = document.createElement('div');
		donut_center.className = 'sr-disk-donut-center';
		const donut_value = document.createElement('strong');
		donut_value.textContent = percent === null ? '—' : `${percent.toLocaleString(this._locale(), {maximumFractionDigits: 1})}%`;
		const donut_label = document.createElement('span');
		donut_label.textContent = this._t('utilizado');
		donut_center.append(donut_value, donut_label);
		donut.append(donut_center);

		const details = document.createElement('div');
		details.className = 'sr-disk-overview-details';
		const title = document.createElement('div');
		title.className = 'sr-disk-overview-title';
		title.textContent = context.label ? `${this._t('Unidad')} ${context.label}` : this._t('Unidad de disco');

		const legend = document.createElement('div');
		legend.className = 'sr-disk-legend';
		legend.append(
			this._diskLegendItem('sr-disk-legend-used', this._t('Utilizado'), percent === null ? '—' : `${percent.toFixed(1)}%`),
			this._diskLegendItem('sr-disk-legend-free', this._t('Disponible'), percent === null ? '—' : `${(100 - percent).toFixed(1)}%`)
		);

		const values = document.createElement('div');
		values.className = 'sr-disk-values';
		for (const [label, value] of [['Usado', used], ['Libre', free], ['Total', total]]) {
			const card = document.createElement('div');
			const name = document.createElement('span');
			name.textContent = this._t(label);
			const amount = document.createElement('strong');
			amount.textContent = value === null ? '—' : this._formatValue(value, 'B');
			card.append(name, amount);
			values.append(card);
		}

		details.append(title, legend, values);
		overview.append(donut, details);

		return overview;
	}

	_diskLegendItem(class_name, label, value) {
		const item = document.createElement('div');
		item.className = 'sr-disk-legend-item';
		const dot = document.createElement('span');
		dot.className = class_name;
		const caption = document.createElement('span');
		caption.textContent = `${label}: ${value}`;
		item.append(dot, caption);
		return item;
	}

	_createSvgChart(raw_points, units) {
		return this._createInteractiveChart([
			{name: this._t('Valor'), color: '#00a88f', points: raw_points}
		], units);
	}

	_createMultiChart(series, units) {
		return this._createInteractiveChart(series, units);
	}

	_createInteractiveChart(raw_series, units) {
		const series = raw_series.map(item => ({
			name: item.name || this._t('Valor'),
			color: item.color || '#00a88f',
			points: (item.points || [])
				.map(point => [Number(point[0]), Number(point[1])])
				.filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))
				.sort((a, b) => a[0] - b[0])
		})).filter(item => item.points.length > 0);

		if (!series.length) {
			return this._message('sr-history-empty sr-history-empty-compact', this._t('No existen puntos para representar.'));
		}

		const all_clocks = series.flatMap(item => item.points.map(point => point[0]));
		const original = {min: Math.min(...all_clocks), max: Math.max(...all_clocks)};
		const view = {...original};
		const wrapper = document.createElement('div');
		wrapper.className = 'sr-chart-wrapper';
		const toolbar = document.createElement('div');
		toolbar.className = 'sr-chart-toolbar';
		const legend = document.createElement('div');
		legend.className = 'sr-chart-legend';
		for (const item of series) {
			const entry = document.createElement('span');
			entry.style.setProperty('--sr-series-color', item.color);
			entry.textContent = item.name;
			legend.append(entry);
		}
		const hint = this._element('span', 'sr-chart-hint', this._t('Mueva el cursor para ver valores · arrastre para ampliar'));
		const reset = document.createElement('button');
		reset.type = 'button';
		reset.className = 'sr-chart-reset';
		reset.textContent = this._t('Restablecer zoom');
		reset.hidden = true;
		toolbar.append(legend, hint, reset);
		const stage = document.createElement('div');
		stage.className = 'sr-chart-stage';
		wrapper.append(toolbar, stage);

		const render = () => {
			const visible = series.map(item => {
				let points = item.points.filter(point => point[0] >= view.min && point[0] <= view.max);
				if (points.length < 2) {
					points = item.points;
				}
				return {...item, points};
			});
			const svg = this._createSeriesSvg(visible, units);
			const tooltip = this._element('div', 'sr-chart-tooltip');
			tooltip.hidden = true;
			const crosshair = this._element('div', 'sr-chart-crosshair');
			crosshair.hidden = true;
			const selection = this._element('div', 'sr-chart-selection');
			selection.hidden = true;
			stage.replaceChildren(svg, crosshair, selection, tooltip);
			reset.hidden = view.min === original.min && view.max === original.max;

			let drag_start = null;
			const geometry = event => {
				const rect = svg.getBoundingClientRect();
				const left = rect.left + rect.width * 86 / 900;
				const right = rect.right - rect.width * 32 / 900;
				const client_x = Math.max(left, Math.min(right, event.clientX));
				const ratio = (client_x - left) / Math.max(1, right - left);
				return {
					rect, left, right, client_x, ratio,
					clock: view.min + ratio * (view.max - view.min),
					stage_x: client_x - stage.getBoundingClientRect().left
				};
			};
			const show_tooltip = event => {
				const position = geometry(event);
				crosshair.hidden = false;
				crosshair.style.left = `${position.stage_x}px`;
				const lines = [new Date(position.clock * 1000).toLocaleString(this._locale())];
				for (const item of visible) {
					const nearest = item.points.reduce((best, point) =>
						Math.abs(point[0] - position.clock) < Math.abs(best[0] - position.clock) ? point : best
					, item.points[0]);
					lines.push(`${item.name}: ${this._formatValue(nearest[1], units)}`);
				}
				tooltip.replaceChildren(...lines.map((line, index) => this._element('div', index === 0 ? 'sr-chart-tooltip-time' : '', line)));
				tooltip.hidden = false;
				const max_left = Math.max(8, stage.clientWidth - tooltip.offsetWidth - 8);
				tooltip.style.left = `${Math.min(max_left, Math.max(8, position.stage_x + 12))}px`;
				tooltip.style.top = '12px';
			};

			svg.addEventListener('pointermove', event => {
				show_tooltip(event);
				if (drag_start !== null) {
					const current = geometry(event).stage_x;
					selection.hidden = false;
					selection.style.left = `${Math.min(drag_start, current)}px`;
					selection.style.width = `${Math.abs(current - drag_start)}px`;
				}
			});
			svg.addEventListener('pointerleave', () => {
				if (drag_start === null) {
					tooltip.hidden = true;
					crosshair.hidden = true;
				}
			});
			svg.addEventListener('pointerdown', event => {
				drag_start = geometry(event).stage_x;
				svg.setPointerCapture(event.pointerId);
			});
			svg.addEventListener('pointerup', event => {
				if (drag_start === null) return;
				const end = geometry(event);
				const start_position = drag_start;
				drag_start = null;
				selection.hidden = true;
				if (Math.abs(end.stage_x - start_position) < 18) return;
				const rect = svg.getBoundingClientRect();
				const stage_rect = stage.getBoundingClientRect();
				const plot_left = rect.left + rect.width * 86 / 900 - stage_rect.left;
				const plot_right = rect.right - rect.width * 32 / 900 - stage_rect.left;
				const to_clock = x => view.min + Math.max(0, Math.min(1, (x - plot_left) / (plot_right - plot_left))) * (view.max - view.min);
				const first = to_clock(Math.min(start_position, end.stage_x));
				const last = to_clock(Math.max(start_position, end.stage_x));
				view.min = first;
				view.max = last;
				render();
			});
		};

		reset.addEventListener('click', () => {
			view.min = original.min;
			view.max = original.max;
			render();
		});
		render();
		return wrapper;
	}

	_createSeriesSvg(series, units) {
		const ns = 'http://www.w3.org/2000/svg';
		const width = 900;
		const height = 330;
		const margin = {top: 12, right: 32, bottom: 42, left: 86};
		const plot_width = width - margin.left - margin.right;
		const plot_height = height - margin.top - margin.bottom;
		const points = series.flatMap(item => item.points);
		const clocks = points.map(point => point[0]);
		const values = points.map(point => point[1]);
		let x_min = Math.min(...clocks);
		let x_max = Math.max(...clocks);
		let y_min = Math.min(...values);
		let y_max = Math.max(...values);
		if (x_min === x_max) { x_min -= 1; x_max += 1; }
		if (units === '%') { y_min = 0; y_max = 100; }
		else if (y_min === y_max) {
			const pad = Math.abs(y_min) * .1 || 1;
			y_min -= pad; y_max += pad;
		}
		else {
			const pad = (y_max - y_min) * .08;
			y_min -= pad; y_max += pad;
		}

		const x = clock => margin.left + (clock - x_min) / (x_max - x_min) * plot_width;
		const y = value => margin.top + (y_max - value) / (y_max - y_min) * plot_height;
		const svg = document.createElementNS(ns, 'svg');
		svg.classList.add('sr-history-chart');
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.setAttribute('role', 'img');
		svg.setAttribute('aria-label', this._t('Gráfico histórico interactivo'));

		const line = (x1, y1, x2, y2, class_name) => {
			const element = document.createElementNS(ns, 'line');
			element.classList.add(class_name);
			for (const [name, value] of Object.entries({x1, y1, x2, y2})) element.setAttribute(name, value);
			svg.append(element);
		};
		const label = (text, px, py, anchor = 'end') => {
			const element = document.createElementNS(ns, 'text');
			element.classList.add('axis-label');
			element.setAttribute('x', px);
			element.setAttribute('y', py);
			element.setAttribute('text-anchor', anchor);
			element.textContent = text;
			svg.append(element);
		};
		for (let index = 0; index <= 4; index++) {
			const value = y_min + (y_max - y_min) * index / 4;
			line(margin.left, y(value), width - margin.right, y(value), 'grid-line');
			label(this._formatValue(value, units), margin.left - 8, y(value) + 3);
			const clock = x_min + (x_max - x_min) * index / 4;
			line(x(clock), margin.top, x(clock), margin.top + plot_height, 'grid-line');
			label(this._formatClock(clock), x(clock), height - 12, 'middle');
		}

		for (const item of series) {
			if (!item.points.length) continue;
			const line_path = item.points.map((point, index) =>
				`${index === 0 ? 'M' : 'L'} ${x(point[0]).toFixed(2)} ${y(point[1]).toFixed(2)}`
			).join(' ');
			const first = item.points[0];
			const last = item.points[item.points.length - 1];
			const baseline = margin.top + plot_height;
			const area = document.createElementNS(ns, 'path');
			area.classList.add('series-area');
			area.style.fill = item.color;
			area.setAttribute('d', `${line_path} L ${x(last[0]).toFixed(2)} ${baseline} L ${x(first[0]).toFixed(2)} ${baseline} Z`);
			const path = document.createElementNS(ns, 'path');
			path.classList.add('line');
			path.style.stroke = item.color;
			path.setAttribute('d', line_path);
			svg.append(area, path);
			const dot = document.createElementNS(ns, 'circle');
			dot.classList.add('last-dot');
			dot.style.fill = item.color;
			dot.setAttribute('cx', x(last[0]));
			dot.setAttribute('cy', y(last[1]));
			dot.setAttribute('r', 4);
			const current = document.createElementNS(ns, 'text');
			current.classList.add('current-value-label');
			current.style.fill = item.color;
			current.setAttribute('x', x(last[0]) - 8);
			current.setAttribute('y', Math.max(24, y(last[1]) - 9));
			current.setAttribute('text-anchor', 'end');
			current.textContent = `${item.name !== this._t('Valor') ? `${item.name}: ` : ''}${this._formatValue(last[1], units)}`;
			svg.append(dot, current);
		}
		return svg;
	}

	_createStaticSvgChart(raw_points, units) {
		const ns = 'http://www.w3.org/2000/svg';
		const width = 900;
		const height = 330;
		const margin = {top: 12, right: 32, bottom: 42, left: 86};
		const plot_width = width - margin.left - margin.right;
		const plot_height = height - margin.top - margin.bottom;
		const points = raw_points
			.map(point => [Number(point[0]), Number(point[1])])
			.filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))
			.sort((a, b) => a[0] - b[0]);

		const svg = document.createElementNS(ns, 'svg');
		svg.classList.add('sr-history-chart');
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.setAttribute('role', 'img');
		svg.setAttribute('aria-label', this._t('Gráfico histórico interactivo'));

		const defs = document.createElementNS(ns, 'defs');
		const gradient = document.createElementNS(ns, 'linearGradient');
		const gradient_id = `sr-area-gradient-${Math.random().toString(36).slice(2)}`;
		gradient.id = gradient_id;
		gradient.setAttribute('x1', '0');
		gradient.setAttribute('x2', '0');
		gradient.setAttribute('y1', '0');
		gradient.setAttribute('y2', '1');
		for (const [offset, opacity] of [['0%', '.34'], ['100%', '.02']]) {
			const stop = document.createElementNS(ns, 'stop');
			stop.setAttribute('offset', offset);
			stop.setAttribute('stop-color', '#00a88f');
			stop.setAttribute('stop-opacity', opacity);
			gradient.append(stop);
		}
		defs.append(gradient);
		svg.append(defs);

		const clocks = points.map(point => point[0]);
		const values = points.map(point => point[1]);
		let x_min = Math.min(...clocks);
		let x_max = Math.max(...clocks);
		let y_min = Math.min(...values);
		let y_max = Math.max(...values);

		if (x_min === x_max) {
			x_min -= 1;
			x_max += 1;
		}
		if (units === '%') {
			y_min = 0;
			y_max = 100;
		}
		else if (y_min === y_max) {
			const pad = Math.abs(y_min) * .1 || 1;
			y_min -= pad;
			y_max += pad;
		}
		else {
			const pad = (y_max - y_min) * .08;
			y_min -= pad;
			y_max += pad;
		}

		const x = clock => margin.left + (clock - x_min) / (x_max - x_min) * plot_width;
		const y = value => margin.top + (y_max - value) / (y_max - y_min) * plot_height;
		const add_line = (x1, y1, x2, y2) => {
			const line = document.createElementNS(ns, 'line');
			line.classList.add('grid-line');
			line.setAttribute('x1', x1);
			line.setAttribute('y1', y1);
			line.setAttribute('x2', x2);
			line.setAttribute('y2', y2);
			svg.append(line);
		};
		const add_text = (text, tx, ty, anchor = 'end') => {
			const label = document.createElementNS(ns, 'text');
			label.classList.add('axis-label');
			label.setAttribute('x', tx);
			label.setAttribute('y', ty);
			label.setAttribute('text-anchor', anchor);
			label.textContent = text;
			svg.append(label);
		};

		for (let index = 0; index <= 4; index++) {
			const value = y_min + (y_max - y_min) * index / 4;
			const py = y(value);
			add_line(margin.left, py, width - margin.right, py);
			add_text(this._formatValue(value, units), margin.left - 8, py + 3);
		}

		for (let index = 0; index <= 4; index++) {
			const clock = x_min + (x_max - x_min) * index / 4;
			const px = x(clock);
			add_line(px, margin.top, px, margin.top + plot_height);
			add_text(this._formatClock(clock), px, height - 12, 'middle');
		}

		const line_path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point[0]).toFixed(2)} ${y(point[1]).toFixed(2)}`).join(' ');
		const area_path = `${line_path} L ${x(points[points.length - 1][0]).toFixed(2)} ${(margin.top + plot_height).toFixed(2)} L ${x(points[0][0]).toFixed(2)} ${(margin.top + plot_height).toFixed(2)} Z`;

		const area = document.createElementNS(ns, 'path');
		area.classList.add('area');
		area.setAttribute('d', area_path);
		area.setAttribute('fill', `url(#${gradient_id})`);
		const line = document.createElementNS(ns, 'path');
		line.classList.add('line');
		line.setAttribute('d', line_path);
		svg.append(area, line);

		const last = points[points.length - 1];
		const dot = document.createElementNS(ns, 'circle');
		dot.classList.add('last-dot');
		dot.setAttribute('cx', x(last[0]));
		dot.setAttribute('cy', y(last[1]));
		dot.setAttribute('r', 4);
		svg.append(dot);

		return svg;
	}

	_formatValue(value, units) {
		if (value === null || value === undefined || value === '') {
			return '—';
		}
		value = Number(value);
		if (!Number.isFinite(value)) {
			return '—';
		}

		if (units === 'B' || units === 'Bps' || units === 'bps') {
			const suffixes = units === 'B'
				? ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
				: (units === 'bps' ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['Bps', 'KBps', 'MBps', 'GBps', 'TBps']);
			const divisor = units === 'bps' ? 1000 : 1024;
			let index = 0;
			while (Math.abs(value) >= divisor && index < suffixes.length - 1) {
				value /= divisor;
				index++;
			}
			return `${value.toLocaleString(this._locale(), {maximumFractionDigits: value >= 100 ? 0 : 1})} ${suffixes[index]}`;
		}

		if (units === 'uptime') {
			const days = Math.floor(value / 86400);
			const hours = Math.floor(value % 86400 / 3600);
			return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
		}

		const decimals = Math.abs(value) >= 100 ? 0 : 2;
		return `${value.toLocaleString(this._locale(), {maximumFractionDigits: decimals})}${units ? (units === '%' ? units : ` ${units}`) : ''}`;
	}

	_formatClock(timestamp) {
		if (!Number.isFinite(Number(timestamp)) || Number(timestamp) <= 0) {
			return '—';
		}
		const date = new Date(timestamp * 1000);
		return date.toLocaleString(this._locale(), {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	_toLocalDateTime(timestamp) {
		const date = new Date(timestamp * 1000);
		const pad = value => String(value).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	_message(class_name, text) {
		const message = document.createElement('div');
		message.className = class_name;
		message.textContent = text;
		return message;
	}

	_closeHistory() {
		if (this._history_request !== null) {
			this._history_request.abort();
			this._history_request = null;
		}

		if (this._history_overlay !== null) {
			this._history_overlay.remove();
			this._history_overlay = null;
		}

		if (this._host_overlay === null) {
			document.removeEventListener('keydown', this._escape_handler);
		}
	}

	_closeHostDetails() {
		if (this._host_request !== null) {
			this._host_request.abort();
			this._host_request = null;
		}
		if (this._host_overlay !== null) {
			this._host_overlay.remove();
			this._host_overlay = null;
		}
		if (this._host_resize_handler !== null) {
			window.removeEventListener('resize', this._host_resize_handler);
			this._host_resize_handler = null;
		}
		if (this._history_overlay === null) {
			document.removeEventListener('keydown', this._escape_handler);
		}
	}
}
