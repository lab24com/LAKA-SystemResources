<?php declare(strict_types = 0);

namespace Modules\SystemResources\Actions;

use API,
	CController,
	CControllerResponseData,
	CItemHelper,
	Manager;

class History extends CController {

	protected function init(): void {
		$this->disableCsrfValidation();
	}

	protected function checkPermissions(): bool {
		return $this->getUserType() >= USER_TYPE_ZABBIX_USER;
	}

	protected function checkInput(): bool {
		$fields = [
			'itemid' => 'id|required',
			'time_from' => 'int32|required',
			'time_to' => 'int32|required'
		];

		$ret = $this->validateInput($fields);
		if (!$ret) {
			$this->setJsonResponse([
				'error' => ['messages' => array_column(get_and_clear_messages(), 'message')]
			]);
		}

		return $ret;
	}

	protected function doAction(): void {
		try {
			$this->loadHistory();
		}
		catch (\Throwable $exception) {
			$this->setJsonResponse([
				'error' => ['messages' => [_('No fue posible consultar el histórico del ítem.')]]
			]);
		}
	}

	private function loadHistory(): void {
		$time_to = min((int) $this->getInput('time_to'), time());
		$time_from = max((int) $this->getInput('time_from'), $time_to - SEC_PER_YEAR);

		if ($time_from >= $time_to) {
			$this->setJsonResponse(['error' => ['messages' => [_('El rango de tiempo no es válido.')]]]);
			return;
		}

		$items = API::Item()->get([
			'output' => ['itemid', 'hostid', 'name', 'key_', 'value_type', 'units', 'history', 'trends'],
			'selectHosts' => ['name'],
			'itemids' => $this->getInput('itemid'),
			'webitems' => true,
			'filter' => [
				'value_type' => [ITEM_VALUE_TYPE_FLOAT, ITEM_VALUE_TYPE_UINT64]
			]
		]);

		if (!$items) {
			$this->setJsonResponse(['error' => ['messages' => [_('El ítem no existe o no tiene datos numéricos.')]]]);
			return;
		}

		$item = reset($items);
		[$item] = CItemHelper::addDataSource([$item], $time_from);
		$data = Manager::History()->getGraphAggregationByWidth([$item], $time_from, $time_to, 900);
		$points = [];

		if ($data) {
			$item_data = reset($data);
			foreach ($item_data['data'] ?? [] as $point) {
				if ($point['avg'] !== null) {
					$points[] = [(int) $point['clock'], (float) $point['avg']];
				}
			}
		}

		usort($points, static fn(array $a, array $b): int => $a[0] <=> $b[0]);
		$values = array_column($points, 1);

		$this->setJsonResponse([
			'itemid' => (string) $item['itemid'],
			'name' => $item['name'],
			'host' => $item['hosts'] ? reset($item['hosts'])['name'] : '',
			'key' => $item['key_'],
			'units' => $item['units'],
			'time_from' => $time_from,
			'time_to' => $time_to,
			'points' => $points,
			'stats' => $values ? [
				'min' => min($values),
				'max' => max($values),
				'avg' => array_sum($values) / count($values),
				'last' => end($values)
			] : null
		]);
	}

	private function setJsonResponse(array $data): void {
		$this->setResponse(
			(new CControllerResponseData([
				'main_block' => json_encode($data, JSON_THROW_ON_ERROR)
			]))->disableView()
		);
	}
}
