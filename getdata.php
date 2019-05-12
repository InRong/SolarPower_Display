<?php
//setting header to json
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
//
//database details
include "db.php";

//get connection
$mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

function validateDate($date, $format = 'Y-m-d')
{
	    $d = DateTime::createFromFormat($format, $date);
	        return $d && $d->format($format) == $date;
}

if(!$mysqli){
	die("Connection failed: " . $mysqli->error);
	}

@$PERIOD=$_GET["PERIOD"];
@$DATE=$_GET["DATE"];
if (!isset($PERIOD)) { $PERIOD=10000; }
if (is_numeric($PERIOD)) { 
	$query = sprintf("SELECT LogTime, GeneratedPower, UsedPower, (GeneratedPower-UsedPower) as Exported FROM powerReadings WHERE LogTime > now()-$PERIOD ORDER BY LogTime");
	$GETDATE=array("DATE"=>"TODAY");
} elseif ($PERIOD=="TODAY") {
	$mysqli->query("SET @i:=0");
	$GETDATE=array("DATE"=>"TODAY");
	//$query = "SELECT Time as LogTime,ROUND(`Gen`) as `GeneratedPower`, ROUND(`Used`) as `UsedPower`,ROUND(`Gen`-`Used`) as Exported FROM(
	$query = "SELECT Time as LogTime,`Gen` as `GeneratedPower`, `Used` as `UsedPower`,`Gen`-`Used` as Exported FROM(
		SELECT MAX(`LogTime`) as Time, AVG(`UsedPower`) as Used, AVG(`GeneratedPower`) as Gen FROM
		(
			    SELECT
			            @i:=@i+1 as rownum,
				            FLOOR(@i/10) AS `datagrp`,
					            `LogTime`,
						            `UsedPower`,`GeneratedPower`
							        FROM powerReadings
								    WHERE `LogTime` >= CURDATE() 
								        ORDER BY `LogTime` ASC
								) as a
								GROUP BY `datagrp`) as b";
} elseif ($PERIOD=="DATE") {
	if (validateDate($DATE)) {
		$END_DATE=$DATE." 23:59:59";
		$GETDATE=array("DATE"=>$DATE);
		$mysqli->query("SET @i:=0");
		$query = "SELECT Time as LogTime,`Gen` as `GeneratedPower`, `Used` as `UsedPower`,`Gen`-`Used` as Exported FROM(
			SELECT MAX(`LogTime`) as Time, AVG(`UsedPower`) as Used, AVG(`GeneratedPower`) as Gen FROM
		      	 (
			    SELECT
			            @i:=@i+1 as rownum,
				            FLOOR(@i/10) AS `datagrp`,
					            `LogTime`,
						            `UsedPower`,`GeneratedPower`
							        FROM powerReadings
								    WHERE `LogTime` >= '".$DATE."' AND `LogTime` <= '".$END_DATE."' 
								        ORDER BY `LogTime` ASC
								) as a
								GROUP BY `datagrp`) as b";
	} else {
		http_response_code(400);
		exit(0);
	}
}
	//execute query
	$result = $mysqli->query($query);

	if (!$result) {die("Bad result");}

	//loop through the returned data
	$data = array();
	foreach ($result as $row) {
		$data[] = $row;
		}

	//free memory associated with result
	$result->close();

	//close connection
	$mysqli->close();

	// Add the Additional Information
	$data[] = $GETDATE;
	//now print the data
	print json_encode($data);
?>
