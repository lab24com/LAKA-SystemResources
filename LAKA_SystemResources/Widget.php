<?php declare(strict_types = 0);

namespace Modules\SystemResources;

use Zabbix\Core\CWidget;

class Widget extends CWidget {

	public const OS_ALL = 0;
	public const OS_WINDOWS = 1;
	public const OS_LINUX = 2;
	public const LANGUAGE_ES = 0;
	public const LANGUAGE_EN = 1;
	public const LANGUAGE_PT_BR = 2;
	public const DISK_ALERT_FREE_GB = 0;
	public const DISK_ALERT_PERCENT = 1;

	public function getDefaultName(): string {
		return 'LAKA SystemResources';
	}
}
