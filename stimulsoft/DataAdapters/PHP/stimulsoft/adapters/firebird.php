<?php
class StiFirebirdAdapter {
	private $connectionString = null;
	private $connectionInfo = null;
	private $link = null;
	
	private function getLastErrorResult() {
		$errcode = ibase_errcode();
		if ($errcode == 0) return StiResult::error("Unknown");
		return StiResult::error("[".$errcode."] ".ibase_errmsg());
	}
	
	private function connect() {
		$this->link = ibase_connect($this->connectionInfo->host."/".$this->connectionInfo->port.":".$this->connectionInfo->database, $this->connectionInfo->userId, $this->connectionInfo->password);
		if (!$this->link) return $this->getLastErrorResult();
		return StiResult::success();
	}
	
	private function disconnect() {
		if (!$this->link) return;
		ibase_close($this->link);
	}
	
	public function parse($connectionString) {
		$info = new stdClass();
		$info->host = "";
		$info->port = 3050;
		$info->database = "";
		$info->userId = "";
		$info->password = "";
		
		$parameters = explode(";", $connectionString);
		foreach($parameters as $parameter)
		{
			if (strpos($parameter, "=") < 1) continue;
		
			$parts = explode("=", $parameter);
			$name = strtolower(trim($parts[0]));
			if (count($parts) > 1) $value = $parts[1];
		
			if (isset($value))
			{
				switch ($name)
				{
					case "server":
					case "host":
					case "location":
						$info->host = $value;
						break;
						
					case "port":
						$info->port = $value;
						break;
							
					case "database":
					case "data source":
						$info->database = $value;
						break;
							
					case "uid":
					case "user":
					case "user id":
						$info->userId = $value;
						break;
							
					case "pwd":
					case "password":
						$info->password = $value;
						break;
				}
			}
		}
		
		$this->connectionString = $connectionString;
		$this->connectionInfo = $info;
	}
	
	public function test() {
		$result = $this->connect();
		if ($result->success) $this->disconnect();
		return $result;
	}
	
	public function execute($queryString) {
		$result = $this->connect();
		if ($result->success) {
			$query = ibase_query($this->link, $queryString);
			if (!$query) return $this->getLastErrorResult();
			
			$result->columns = array();
			$result->rows = array();
			while ($rowItem = ibase_fetch_assoc($query)) {
				$row = array();
				foreach ($rowItem as $key => $value) {
					if (count($result->columns) < count($rowItem)) $result->columns[] = $key;
					$row[] = $value;
				}
				$result->rows[] = $row;
			}
			$this->disconnect();
		}
	
		return $result;
	}
}