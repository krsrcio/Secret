<?php
include 'db_connection.php'; 

$sql = "SELECT * FROM posts";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "Post: " . $row["content"] . "<br>";
    }
} else {
    echo "0 results";
}

$conn->close();
?>
