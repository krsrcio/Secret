<?php
$host = 'localhost';
$user = 'root';
$password = 'secret13';
$dbname = 'SecretSQL';

$conn = mysqli_connect($host, $user, $password, $dbname);

if (!$conn) {
    die('Connection failed: ' . mysqli_connect_error());
}

$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];


$sql = "UPDATE users SET email='$email', password='$password' WHERE username='$username'";

if (mysqli_query($conn, $sql)) {
    echo 'Settings updated successfully.';
} else {
    echo 'Error updating settings: ' . mysqli_error($conn);
}

mysqli_close($conn);
?>