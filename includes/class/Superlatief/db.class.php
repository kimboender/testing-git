<?php
/**
* Database Class
*
* This class is used for communication with a database through MySQL Improved (Mysqli)
*
* @copyright	2012-2014 Fratsloos.nl / Superlatief.nl
* @author		Elwin Bockstael <elwin@superlatief.nl>
* @version		0.2
*/

class Database {	
	/**
	* Holds the host of the database
	*
	* @var string
	*/
	private $dbHost = 'localhost';
	
	/**
	* Holds the name of the database
	*
	* @var string
	*/
	private $dbName = '';
	
	
	/**
	* Holds the user of the database
	*
	* @var string
	*/
	private $dbUser = '';
	
	/**
	* Holds the password of the database
	*
	* @var string
	*/
	private $dbPass = '';
	
	/**
	* Holds the value of the lc_time_names for the DB
	*
	* @var string
	*/
	private $locale = 'nl_NL';
	
	/**
	* Holds the connection to the database
	*
	* @var object
	*/
	private $connection = null;
	
	/**
	* Holds the reauls of an query
	*
	* @var mixed result
	*/
	private $result = null;
	
	/**
	* Constructor
	*/
	public function __construct($aDbConfig = array()) {
		// Overwrite the vars
		if(isset($aDbConfig['host'])) $this->dbHost = $aDbConfig['host'];
		if(isset($aDbConfig['user'])) $this->dbUser = $aDbConfig['user'];
		if(isset($aDbConfig['pass'])) $this->dbPass = $aDbConfig['pass'];
		if(isset($aDbConfig['name'])) $this->dbName = $aDbConfig['name'];
		
		// Connect through MySQLi
		$connect = mysqli_connect($this->dbHost,$this->dbUser,$this->dbPass,$this->dbName);
		if($connect === false) return false;
		else {
			$this->connection = $connect;
			if(!$this->query("SET lc_time_names = '".$this->locale."'")) return false;
			if(!$this->query("SET NAMES utf8")) return false;
			
            $dt = new DateTime();
            $offset = $dt->format('P');
            if(!$this->query("SET time_zone='".$offset."'")) return false;
            
			return true;
		}
    }
	
	/**
	* Sends a query to the database
	*
	* @param	string $sql - The query to be executed
	* @return	boolean False when $sql is null
	* @return	array Answer from database
	*/
	public function query($sql = null) {
		if($sql == null) return false;
		else {
			// Execute query
			$res = mysqli_query($this->connection,$sql);
			if($res !== false) {
				$this->result = $res;
				return true;
			}
			
			return false;
		}
	}
	
	/**
	* Returns the latest error from the datbase
	*
	* @return	string error message
	*/
	public function getError() {
    	return mysqli_error($this->connection);
	}
	
	/**
	* Returns the number of rows affected in the last query
	*
	* @return	boolean False when the status of last query is null
	* @return	int number of rows affected
	*/
	public function numRows() {
		if($this->result == null) return false;
		else return mysqli_num_rows($this->result);
	}
	
	/**
	* Returns an associative array with one result, key values of the array are the selected columns in the SELECT-query
	*
	* @return	boolean False when select did not find one row (eg. zero or more than one row)
	* @return	array result
	*/
	public function fetch() {
		if($this->numRows() != 1) return false;
		else {
			return mysqli_fetch_assoc($this->result);
		}
	}
	
	/**
	* Returns an associative array with the results of the last SELECT-query, key values of the array are the selected columns in the SELECT-query
	*
	* @return	boolean False when select did not find one or more rows
	* @return	array result
	*/
	public function fetchAll() {
		if($this->numRows() == 0) return false;
		else {
			$aData = array();
			while($row = mysqli_fetch_assoc($this->result)) {
				$data = array();
				foreach($row as $k => $v) $data[$k] = $v;
				
				$aData[] = $data;
			}
			
			return $aData;
		}
	}
	
	/**
	* Returns the auto_increment value of the last INSERT-query
	*
	* @return	int Id
	*/
	public function insertId() {
		return mysqli_insert_id($this->connection);
	}
	
	/**
	* Cleans the data going in the database
	*
	* @param	string $s - The data to be cleaned
	* @return	string Cleaned data
	*/
	public function escape($s) {
		return mysqli_real_escape_string($this->connection,$s);
	}
	
	/**
	* This functions returns an array with options form an ENUM
	*
	* @param	string $t - table
	* @param	string $c - column
	* @return	boolean on error
	*			array with options
	*/
	public function getEnumOptions($t = null,$c = null) {
		// Check vars
		if($t == null || $c == null) return false;
		else {
			// Run the query
			$sql = "SHOW COLUMNS FROM ".$this->escape($t)." LIKE '".$this->escape($c)."'";
			$res = $this->query($sql);
			if($res == false) return false;
			else {
				$table = $this->fetch($res);
				$table['Type'] = str_replace(array('enum','(',')',"'"),'',strtolower($table['Type']));
				return explode(',',$table['Type']);
			}
		}
	}
}
?>