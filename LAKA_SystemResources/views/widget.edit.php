<?php declare(strict_types = 0);

$form = new CWidgetFormView($data);

$groupids = array_key_exists('groupids', $data['fields'])
	? new CWidgetFieldMultiSelectGroupView($data['fields']['groupids'])
	: null;

$form
	->addField($groupids)
	->addField(array_key_exists('hostids', $data['fields'])
		? (new CWidgetFieldMultiSelectHostView($data['fields']['hostids']))
			->setFilterPreselect([
				'id' => $groupids->getId(),
				'accept' => CMultiSelect::FILTER_PRESELECT_ACCEPT_ID,
				'submit_as' => 'groupid'
			])
		: null
	)
	->addField(new CWidgetFieldRadioButtonListView($data['fields']['display_language']))
	->addField(new CWidgetFieldRadioButtonListView($data['fields']['os_filter']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['host_limit']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['stale_seconds']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['warn_threshold']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['crit_threshold']))
	->addField(new CWidgetFieldRadioButtonListView($data['fields']['disk_alert_mode']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['disk_warn_free_gb']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['disk_crit_free_gb']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['disk_warn_percent']))
	->addField(new CWidgetFieldIntegerBoxView($data['fields']['disk_crit_percent']))
	->addField(new CWidgetFieldCheckBoxView($data['fields']['maintenance']))
	->addField(new CWidgetFieldCheckBoxView($data['fields']['group_by_os']))
	->show();
