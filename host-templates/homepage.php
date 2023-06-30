<?php

//echo "USER PHP INFO {$_SERVER['USER']. phpinfo()}<br />";


   //Let's now print out the received values in the browser
  // echo "Your api key: {$_POST['ApiKey']}<br />";
  // echo "Your publish year: {$_POST['PostPublishYear']}<br />";
  // echo "Your publish month: {$_POST['PostPublishMonth']}<br />";
  // echo "Your slug: {$_POST['PostSlug']}<br /><br />";
  // echo "Your post:<br />{$_POST['PostBody']}<br /><br />";
  // echo "You are PostUserId: {$_POST['PostUserId']}<br />";

	// $pubYear = $_POST['PostPublishYear'];
	// $pubMonth = $_POST['PostPublishMonth'];
	// $pubFileName = $_POST['PostSlug'] . ".html";

  $filedir = "/";
  $filepath = "index.html";

   echo $_POST['PostBody'];
	$apiKey = $_POST['apiKey'];
	
	if ($apiKey = "[[ add inbox key here ]]"){

		$bIsFolderAvailable = true;


		if ($bIsFolderAvailable){
			$stringData = $_POST['PostBody'];
			if (empty($stringData)){
				echo 'no home page body';	
			}
			else{
				$myFile = $filepath;
				echo $myFile;
				$fh = fopen($myFile, 'w') or die("can't open file");
				// $stringData = htmlentities($_POST['PostBody']);

				fwrite($fh, $stringData);
				fclose($fh);
				echo 'end of post';
			}

		}



		
	}
	else{
		echo 'no api key match';
	}



?>
