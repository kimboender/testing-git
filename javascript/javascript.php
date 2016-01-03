<?php
$content = '';

$aJsIgnore = array('css3-mediaqueries.js');
$aJs = array('jquery.js','modernizr.js');

foreach($aJs as $js) {
    if(isset($_GET['filename'])) $content .= "/**\n\tFile: ".$js."\n*/\n";
    if(is_file($js)) $content .= file_get_contents($js).PHP_EOL;
}

$aNoJquery = array();
if ($handle = opendir('.')) {
    while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != ".." && $file != "javascript.php" && is_file($file) && !in_array($file,$aJs) && !in_array($file,$aJsIgnore)) {
            if(stristr($file,'jquery')) {
                if(isset($_GET['filename'])) $content .= "/**\n\tFile: ".$file."\n*/\n";
                $content .= file_get_contents($file).PHP_EOL;
            }
            else $aNoJquery[] = $file;
        }
    }
    
    if(in_array('layout.js',$aNoJquery)) {
        if(isset($_GET['filename'])) $content .= "/**\n\tFile: layout.js\n*/\n";
        $content .= file_get_contents('layout.js').PHP_EOL;
    }
    foreach($aNoJquery as $file) {
        if($file == 'layout.js') continue;
        if(isset($_GET['filename'])) $content .= "/**\n\tFile: ".$file."\n*/\n";
        $content .= file_get_contents($file).PHP_EOL;
    }
    
    closedir($handle);
}

// Headers en inhoud versturen
$expires = 60*60*24*14;
header("Pragma: public");
header("Cache-Control: maxage=".$expires);
header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
header('Content-type: application/javascript');
echo $content;
?>