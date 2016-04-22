<?php
require_once 'stimulsoft/helper.php';

error_reporting(0);
header("Access-Control-Allow-Origin: *");


$handler = new StiHandler();
$handler->registerErrorHandlers();

$handler->onPrintReport = function ($event) {
	return StiResult::success();
};

$handler->onBeginExportReport = function ($event) {
	$settings = $event->settings;
	$format = $event->format;
	return StiResult::success();
};

$handler->onEndExportReport = function ($event) {
	$format = $event->format; // Export format
	$data = $event->data; // Base64 export data
	$fileName = $event->fileName; // Report file name
	
	//return StiResult::success();
	return StiResult::success("Export OK. Message from server side.");
	//return StiResult::error("Export ERROR. Message from server side.");
};

$handler->onEmailReport = function ($event) {
	$event->settings->from = "******@gmail.com";
	$event->settings->host = "smtp.gmail.com";
	$event->settings->login = "******";
	$event->settings->password = "******";
};

$handler->onDesignReport = function ($event) {
	return StiResult::success();
};

$handler->onCreateReport = function ($event) {
	$fileName = $event->fileName;
	return StiResult::success();
};

$handler->onSaveReport = function ($event) {
	$report = $event->report; // Report JSON object
	$fileName = $event->fileName; // Report file name
	
	return StiResult::success("Save Report OK: ".$fileName);
};

$handler->onSaveAsReport = function ($event) {
	return StiResult::success();
};

$handler->process();