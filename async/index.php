<?php
session_start();

// Include config
require('../includes/config.php');
//require('../includes/functies.php');

// Vars
$html = '';

// Array met het antwoord
$aJson = array(
		'status' => false,
		'message' => 'There has been an unexpected error while processing this command.'
	);

// Op basis van command het bestand includen
if(isset($_POST['command']) && is_file($_POST['command'].'.php')) require($_POST['command'].'.php');
else if(isset($_GET['command']) && is_file($_GET['command'].'.php')) require($_GET['command'].'.php');

// Geef de JSON terug
exit(json_encode($aJson));
?>