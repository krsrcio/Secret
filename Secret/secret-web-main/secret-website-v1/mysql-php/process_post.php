<?php
include 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $content = $_POST["content"];

    $sql = "INSERT INTO posts (content) VALUES ('$content')";

    if ($conn->query($sql) === TRUE) {
        echo "Post created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

$conn->close();
?>
