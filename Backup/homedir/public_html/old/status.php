<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check Your eTAS Application</title>
  <link rel="icon" type="image/png" href="img/somalia_fav.jpg">

  <!-- Bootstrap 5.3 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <!-- Inter Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link href="css/style.css" rel="stylesheet">
</head>
<body>

<?php 
$page = 'status';
include 'header.php';
?>

<!-- Hero Section -->
<section class="hero-about text-center py-8 text-white">
  <div class="container py-5">
    <h1 class="display-4 fw-bold"  style="font-size:2.8em">Check your eTAS application</h1>
    <p class="lead col-lg-8 mx-auto mt-3">
      Quickly track the status of your eTAS application.
    </p>
  </div>
</section>

<!-- Application Tracking Form -->
<section id="track-application" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <div class="card shadow-lg border-0 rounded-3 p-4">
          <h3 class="fw-bold text-center text-primary mb-4" style="font-size:1.3em">Track your application</h3>

          <form class="row g-3">
            <!-- Application ID -->
            <div class="col-12">
              <label for="ApplicationID" class="form-label fw-semibold">Application ID</label>
              <input type="text" class="form-control" id="ApplicationID" placeholder="Enter your application ID">
            </div>

            <!-- Submit Button -->
            <div class="col-12 text-center mt-3">
              <button type="submit" class="btn btn-primary px-5 w-100 shadow-sm">
                Check status
              </button>
            </div>
          </form>

          <p class="text-center text-muted mt-3 small">
            Ensure your application ID is correct to view the latest status of your eTAS application.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<?php include 'footer.php';?>
<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>