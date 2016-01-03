<?php
/**
* Mail class
*
* Dit is een lokale wrapper class om een mailprovider zoals PHPMailer aan te spreken.
*/

class Mail {
	public $to = null;
	public $subject = null;
	public $from = null;
	public $fromName = null;
	public $greeting = true;
	private $plain = null;
	private $html = null;
	private $siteId = 4;
	private $settings = array();
	
	/**
	* Holds the instance of the database
	*
	* @var string
	*/
	private $db = null;
	
	/**
	* Holds the location of the template file
	*/
	private $template = '../html/email.html';
	
	/**
	* Constructor
	*/
	public function __construct($db) {
		if(!is_object($db)) return false;
		$this->db = $db;
		$this->settings = $this->getSettings();
		
		$this->from = $this->settings['sit_ins_email'];
		$this->fromName = $this->settings['sit_ins_email_naam'];
		
		return true;
    }
	
	public function plain($plain = '') {
		$plain = str_replace('%url%','http://'.$_SERVER['HTTP_HOST'].'/',$plain);
		$this->plain = $plain;
		if($this->greeting) $this->plain .= $this->getGreeting('plain');
	}
	
	public function html($html = '') {
		$html = str_replace('%url%','http://'.$_SERVER['HTTP_HOST'].'/',$html);
		$this->html = $html;
		if($this->greeting) $this->html .= $this->getGreeting('html');
	}
	
	public function send() {
		if($this->to == null) return false;
		if($this->subject == null) return false;
		
		// Als de ontvanger de eigenaar vabn de site is komt er extra info in het bericht
		if(strtolower($this->to) == strtolower($this->settings['sit_ins_email'])) {
    		$this->plain .= "\n\n".date('d-m-Y H:i:s')." / ".$_SERVER['REMOTE_ADDR'];
    		$this->html .= '<br><br><font size="1">'.date('d-m-Y H:i:s').' / '.$_SERVER['REMOTE_ADDR'].'</font>';
		}
		
		// HTML aanpassen met template
		if($fp = fopen($this->template, 'r')) {
			// Lees het bestand
			$sContent = fread($fp,filesize($this->template));
			fclose($fp);
			
			// Vervang nu alle tags met de echte inhoud
			$this->html = str_replace('%content%', $this->html, $sContent);
		}

		
		// PHPMailer toevoegen
		if(!class_exists('PHPMailer')) include('../phpmailer/class.phpmailer.php');
		
		$mail = new PHPMailer();
		$mail->From = $this->from;
		$mail->FromName = $this->fromName;
		$mail->Subject = $this->subject;
		$mail->Body = $this->html;
		$mail->AltBody = $this->plain;
		$mail->CharSet = 'UTF-8';
		$mail->AddAddress($this->to);
		$mail->Send();
	}
	
	private function getSettings() {
		$sql = "SELECT
					*
				FROM
					site
				WHERE
					sit_id = ".$this->siteId;
		$res = $this->db->query($sql);
		if($res) {
			return $this->db->fetch();
		}
	}
	
	private function getGreeting($type = 'plain') {
		if($type == 'plain') {
			return "\n\nMet vriendelijke groet,\n\n".$this->settings['sit_ins_email_naam'];
		}
		else if ($type = 'html') {
			return '<br><br>Met vriendelijke groet,<br><br><b>'.$this->settings['sit_ins_email_naam'].'</b>';
		}
	}
}
?>