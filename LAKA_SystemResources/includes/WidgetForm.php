<?php declare(strict_types = 0);

namespace Modules\SystemResources\Includes;

use Modules\SystemResources\Widget;
use Zabbix\Widgets\{
	CWidgetField,
	CWidgetForm
};
use Zabbix\Widgets\Fields\{
	CWidgetFieldCheckBox,
	CWidgetFieldIntegerBox,
	CWidgetFieldMultiSelectGroup,
	CWidgetFieldMultiSelectHost,
	CWidgetFieldRadioButtonList
};

class WidgetForm extends CWidgetForm {

	public function addFields(): self {
		return $this
			->addField($this->isTemplateDashboard()
				? null
				: new CWidgetFieldMultiSelectGroup('groupids', _('Grupos de hosts'))
			)
			->addField($this->isTemplateDashboard()
				? null
				: new CWidgetFieldMultiSelectHost('hostids', _('Hosts'))
			)
			->addField(
				(new CWidgetFieldRadioButtonList('display_language', 'Idioma / Language / Idioma', [
					Widget::LANGUAGE_ES => 'Español',
					Widget::LANGUAGE_EN => 'English',
					Widget::LANGUAGE_PT_BR => 'Português (Brasil)'
				]))->setDefault(Widget::LANGUAGE_ES)
			)
			->addField(
				(new CWidgetFieldRadioButtonList('os_filter', _('Sistemas operativos'), [
					Widget::OS_ALL => _('Windows y Linux'),
					Widget::OS_WINDOWS => _('Solo Windows'),
					Widget::OS_LINUX => _('Solo Linux')
				]))->setDefault(Widget::OS_ALL)
			)
			->addField(
				(new CWidgetFieldIntegerBox('host_limit', _('Límite de servidores'), 1, 500))
					->setDefault(100)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('stale_seconds', _('Sin datos después de (segundos)'), 60, 3600))
					->setDefault(300)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('warn_threshold', _('Advertencia CPU/RAM (%)'), 1, 99))
					->setDefault(75)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('crit_threshold', _('Crítico CPU/RAM (%)'), 2, 100))
					->setDefault(90)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldRadioButtonList('disk_alert_mode', _('Modo de alerta de discos'), [
					Widget::DISK_ALERT_FREE_GB => _('Espacio libre (GB)'),
					Widget::DISK_ALERT_PERCENT => _('Porcentaje utilizado (%)')
				]))->setDefault(Widget::DISK_ALERT_FREE_GB)
			)
			->addField(
				(new CWidgetFieldIntegerBox('disk_warn_free_gb', _('Advertencia: libre menor a (GB)'), 1, 100000))
					->setDefault(20)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('disk_crit_free_gb', _('Crítico: libre menor a (GB)'), 1, 100000))
					->setDefault(10)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('disk_warn_percent', _('Advertencia de disco utilizado (%)'), 1, 99))
					->setDefault(75)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldIntegerBox('disk_crit_percent', _('Crítico de disco utilizado (%)'), 2, 100))
					->setDefault(90)
					->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
			)
			->addField(
				(new CWidgetFieldCheckBox('maintenance', _('Incluir hosts en mantenimiento')))->setDefault(1)
			)
			->addField(
				(new CWidgetFieldCheckBox('group_by_os', _('Separar Windows y Linux')))->setDefault(1)
			);
	}
}
