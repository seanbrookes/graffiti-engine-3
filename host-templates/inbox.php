<?php

//echo "USER PHP INFO {$_SERVER['USER']. phpinfo()}<br />";


   //Let's now print out the received values in the browser
  // echo "Your api key: {$_POST['ApiKey']}<br />";
  // echo "Your publish year: {$_POST['PostPublishYear']}<br />";
  // echo "Your publish month: {$_POST['PostPublishMonth']}<br />";
  // echo "Your slug: {$_POST['PostSlug']}<br /><br />";
  // echo "Your post:<br />{$_POST['PostBody']}<br /><br />";
  // echo "You are PostUserId: {$_POST['PostUserId']}<br />";
	$apiKey = $_POST['apiKey'];
	
	if ($apiKey = "[[ add inbox key here ]]"){
    $pubYear = $_POST['PostPublishYear'];
    $pubMonth = $_POST['PostPublishMonth'];
    $pubFileName = $_POST['PostSlug'] . ".html";

    $filedir = "posts/" . $pubYear . "/" . $pubMonth;
    $filepath = $filedir . "/" . $pubFileName;

    echo $filepath;

  $bIsFolderAvailable = false;

  if(!file_exists($filedir)){

    if(mkdir($filedir,0755,true)){
      echo "The directory $dirname was successfully created.";
      $bIsFolderAvailable = true;

    }
    else{
      echo "The directory $dirname was not created.";
      echo "fail";
    }
  }
  else{
    $bIsFolderAvailable = true;
  }
  if ($bIsFolderAvailable){
    $myFile = $filepath;
    $fh = fopen($myFile, 'w') or die("can't open file");
    $stringData = htmlentities($_POST['PostBody']);
    fwrite($fh, $stringData);
    fclose($fh);
    echo "success?";
  }
 }
?>
