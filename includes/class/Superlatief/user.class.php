<?php
/**
* User Class
*
* This class manages all the user functions, like logged in, user data, etc.
*
* @copyright	2013 Superlatief.nl
* @author		Elwin Bockstael <elwin@superlatief.nl>
* @version		0.1
*/

class User {
	/**
	* Holds the instance of the database
	*
	* @var string
	*/
	private $db = null;
	
	/**
	* Constructor
	*/
	public function __construct($db) {
		if(!is_object($db)) return false;
		$this->db = $db;
		
		return true;
    }
	
	/**
	* Checks if an user is logged in
	*
	* @return	boolean
	*/
	public function checkLogin() {
        // Controle of het cookie aanwezig is
        if(!isset($_COOKIE['login'])) return false;
               
        // Inhoud van het cookie
        $aCookie = explode(";", $_COOKIE['login']);
        
        // Controle van de inhoud
        if(!is_array($aCookie) || count($aCookie) != 2) return false;
        
        // Controleer of het de SU is
        if($aCookie[0] == "su" && $aCookie[1] == md5("134d833afd295436449a19c232fdd9f5")){
            return array(
                        'id' => 0,
                        'email' => 'su'
                    );
        }
        
        // Haal de gegevens van de gebruiker uit de cookie op
        $sql = "SELECT
                    geb_id,
                    geb_wachtwoord
                FROM
                    gebruiker
                WHERE
                    geb_email = '".$this->db->escape($aCookie[0])."'
                AND
                    geb_actief = 'on'";
        $res = $this->db->query($sql);
        if(!$res) return false;
        
        // Regels tellen
        $num = $this->db->numRows();
        
        // Als er één regel is gevonden
        if($num == 1) {
            // Fetch de data
            $aData = $this->db->fetch();
            
            // Controleer of de data correct is
            if($aCookie[1] == md5($aData['geb_wachtwoord'])) {
                return array(
                            'id' => $aData['geb_id'],
                            'email' => $aCookie[0]
                        );
            }
        }
        
        // Geef standaard false terug
        return false;
	}
	
	/**
	* Function to log an user in
	*
	* @return   boolean
	*/
	public function login($email = '',$hash = '',$sleutel = '',$autosignin = false) {
	    // Controleer parameters
    	if($email == '' || $hash == '' || $sleutel == '') return false;
    	
    	// Haal de gegevens van de gebruiker op
        $sql = "SELECT
                    geb_id,
                    geb_wachtwoord,
                    geb_actief,
                    geb_wachtwoord_wijzigen
                FROM
                    gebruiker
                WHERE
                    geb_email = '".$this->db->escape($email)."'";
        $res = $this->db->query($sql);
        if(!$res) return false;
        
        // Regels tellen
        $num = $this->db->numRows();
        
        // Als er één regel is gevonden, of de login is su
        if($num == 1 || $email == 'su') {
            // Fetch de gegevens
            $aData = $this->db->fetch();
            
            // Controle of de response is wat we ervan verwachten
            if(($hash == md5($aData['geb_wachtwoord'].":".$sleutel)) || ($email == 'su' && $hash == md5('134d833afd295436449a19c232fdd9f5:'.$sleutel))) {
                // Ingelogd, controleer of de account actief is
                if($aData['geb_actief'] == 'off' && $email != 'su') {
                    // Account is niet actief
                    return array(
                        'status' => false,
                        'message' => 'Uw account is niet actief. Neem contact op met een beheerder.'
                    );
                }
                else {
        			// THT van de cookie
        			$cookieLengte = 0;
        			if($autosignin) $cookieLengte = time()+31536000;
        			
        			// Plaats de cookie
        			if($email == 'su') setcookie('login', 'su;'.md5("134d833afd295436449a19c232fdd9f5"), $cookieLengte, '/', '.'.$_SERVER['HTTP_HOST']);
        			else setcookie('login', $email.';'.md5($aData['geb_wachtwoord']), $cookieLengte, '/', '.'.$_SERVER['HTTP_HOST']);
        			
        			// Update de code van de gebruiker
        			$sql = "UPDATE
        						gebruiker
        					SET
        						geb_code = ''
        					WHERE
        						geb_id = ".$aData['geb_id'];
        			$res = $this->db->query($sql);
        			
        			// Geef de status terug
        			return true;
                }
            }
        }
        
        // Geef standaard false terug
        return false;
	}
	
	/**
	* Function to log the user out
	*/
	public function logout() {
        setcookie('login', '', time()-3600, '/','.'.$_SERVER['HTTP_HOST']);
        $_SESSION['sleutel'] = '';
	}
	
	/**
	* Function to send a user a link to reset it's password
	*/
	public function sendPasswordEmail($email = '') {
		if($email == '') return false;
		
		// Zoek de gegevens van de gebruiiker op
		$aGebruiker = $this->getUserByEmail($email);
		if($aGebruiker === false) return false;
		
		// Maak een code aan
		$code = md5(time().$aGebruiker['id'].$aGebruiker['email'].rand(9999,99999999));
		
		// Zet de code in de database
		$sql = "UPDATE
					gebruiker
				SET
					geb_code = '".$this->db->escape($code)."'
				WHERE
					geb_id = ".$aGebruiker['id'];
		$res = $this->db->query($sql);
		
		// Maak de e-mail voor de gebruiker
		$plain = "Beste ".$aGebruiker['naam']['voornaam'].",\n\nJe hebt op onze website een aanvraag gedaan voor een nieuw wachtwoord. Dit nieuwe wachtwoord kan ingesteld worden op het volgende adres:\n\n%url%wachtwoord/c/".$code."/e/".urlencode($email)."/\n\nIndien je niet zelf dit wachtwoord hebt aangevraagd kan je deze mail negeren. De volgende keer dat je inlogt wordt deze link automatisch ongeldig.";
		$html = '<b>Beste '.$aGebruiker['naam']['voornaam'].',</b><br><br>Je hebt op onze website een aanvraag gedaan voor een nieuw wachtwoord. Dit nieuwe wachtwoord kan ingesteld worden op het volgende adres:<br><br><a href="%url%wachtwoord/c/'.$code.'/e/'.urlencode($email).'/">%url%wachtwoord/c/'.$code.'/e/'.urlencode($email).'/</a><br><br>Indien je niet zelf dit wachtwoord hebt aangevraagd kan je deze mail negeren. De volgende keer dat je inlogt wordt deze link automatisch ongeldig.';
		
		// Nieuwe instantie van het mailobject
		include('mail.class.php');
		$mail = new Mail($this->db);
		$mail->to = $email;
		$mail->subject = 'Wachtwoord wijzigen';
		$mail->plain($plain);
		$mail->html($html);
		$mail->send();
		
		return true;
	}
	
	/**
	* Function to save a password through email and code
	*/
	public function setPasswordByEmailAndCode($email = '',$code = '',$password = '') {
		if($email == '' || $code == '' || $password == '') return false;
		
		// Haal de gegevens van de gebruiker op op basis van e-mail en code
		$sql = "SELECT
					geb_id
				FROM
					gebruiker
				WHERE
					geb_email = '".$this->db->escape($email)."'
				AND
					geb_code = '".$this->db->escape($code)."'";
		$res = $this->db->query($sql);
		if(!$res) return false;
		
		$num = $this->db->numRows();
		if($num != 1) return false;
		
		// Gebruiker is gevonden, fetch de data
		$aGebruiker = $this->db->fetch();
		
		// Sla het nieuwe wachtwoord van de gebruiker op
		$sql = "UPDATE
					gebruiker
				SET
					geb_wachtwoord = '".$this->db->escape($password)."',
					geb_code = ''
				WHERE
					geb_id = ".$aGebruiker['geb_id'];
		return $this->db->query($sql);
	}
	
	/**
	* Function to save a users password, done by the user
	*/
	public function setPassword($id = 0, $oud = '',$nieuw = '') {
    	if($id == 0 || $oud == '' || $nieuw == '') return false;
    	
    	// Haal de gegevens van de gebruiker op
        $sql = "SELECT
                    geb_id,
                    geb_email
                FROM
                    gebruiker
                WHERE
                    geb_id = '".$this->db->escape($id)."'
                AND
                    geb_wachtwoord = '".$this->db->escape($oud)."'";
        $res = $this->db->query($sql);
        $num = $this->db->numRows();
        
        if($num != 1) return false;
        
        // Fetch de gegevens
        $aGebruiker = $this->db->fetch();
        
        // Sla nu het nieuwe wachtwoord op bij de gebruiker
        $sql = "UPDATE
                    gebruiker
                SET
                    geb_Wachtwoord = '".$this->db->escape($nieuw)."'
                WHERE
                    geb_id = '".$this->db->escape($id)."'";
        $res = $this->db->query($sql);
        if(!$res) return false;
        
        // Nieuw cookie plaatsen
        setcookie("login", $aGebruiker['geb_email'].";".md5($nieuw), 0, "/", '.'.$_SERVER['HTTP_HOST']);
        
        return true;
	}
	
	/**
	* Function to get the user data
	*
	* @param aFilter
	* @return boolean on error
	* @return array on success
	*/
	private function getUser($aFilter = array()) {
        $sql = "SELECT
                    geb_id,
                    geb_voornaam,
                    geb_tussenvoegsel,
                    geb_achternaam,
                    geb_email
                FROM
                    gebruiker
                WHERE
                    ".$aFilter['kolom']." = '".$this->db->escape($aFilter['waarde'])."'";
        $res = $this->db->query($sql);
        if(!$res) return false;
		
		// Tel hoeveel rijen
		$num = $this->db->numRows();
		if($num != 1) return false;
        
        // Fetch de data van de gebruiker
        $aData = $this->db->fetch();
        
        // Zet de data in een gestructureerde array
        $aGebruiker = array(
            'id' => $aData['geb_id'],
            'naam' => array(
                'voornaam' => $aData['geb_voornaam'],
                'tussenvoegsel' => $aData['geb_tussenvoegsel'],
                'achternaam' => $aData['geb_achternaam'],
                'volledig' => $aData['geb_voornaam'].' '.((!empty($aData['geb_tussenvoegsel'])) ? $aData['geb_tussenvoegsel'].' ' : '').$aData['geb_achternaam']
            ),
            'email' => $aData['geb_email']
        );
        
        // Geef het resultaat terug
        return $aGebruiker;    	
	}
	
	/**
	* Function to get the data of a user by id
	*
	* @param id
	*/
	public function getUserById($id = 0) {
	    if(!is_numeric($id) || $id == 0) return false;
	    
	    $aFilter = array(
	        'kolom' => 'geb_id',
	        'waarde' => $id
	    );
	    
	    
	    return $this->getUser($aFilter);
	}
	
	/**
	* Function to get the data of a user by email
	*
	* @param email
	*/
	public function getUserByEmail($email = '') {
	    if($email == '') return false;
	    
	    $aFilter = array(
	        'kolom' => 'geb_email',
	        'waarde' => $email
	    );
	    
	    
	    return $this->getUser($aFilter);
	}
	
	/**
	* Function to generateString to generate a random string
	*/
	public function generateString($length = 200) {
		$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^*()-{}[].,';
		$numChars = strlen($chars);
	
		$string = '';
		for ($i = 0; $i < $length; $i++) {
			$string .= substr($chars, rand(1, $numChars) - 1, 1);
		}
		return $string;
	}
}
?>