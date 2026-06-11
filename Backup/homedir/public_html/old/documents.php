<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Required Documents</title>
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
$page = 'documents';
include 'header.php';
?>

<!-- Hero Section -->
<section class="hero-about text-center py-8 text-white">
  <div class="container py-5">
    <h2 class="display-4 fw-bold"  style="font-size:2.8em">Required Documents</h2>
    <p class="lead col-lg-8 mx-auto mt-3">
      Ensure your documents are complete and accurate to avoid delays in your eTAS application.
    </p>
  </div>
</section>


<!-- Documents Section -->
<section id="documents" class="py-5 bg-light">
  <div class="container">
    <div class="card shadow-lg border-0 rounded-3 p-4">
      <h3 class="mt-4 mb-3">Mandatory Documents</h3>
      <p class="text-muted">
        Please prepare digital copies of the following documents before starting your application. Incomplete or incorrect submissions may result in delays or rejection.
      </p>

      <div class="row g-4">
        <div class="col-md-6">
          <h5 class="fw-semibold">1. Valid Passport</h5>
          <ul class="text-muted">
            <li>Valid for at least six (6) months from intended entry date.</li>
            <li>At least one blank page for immigration stamp.</li>
            <li>Clear color scan of bio-data page required.</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h5 class="fw-semibold">2. Passport-Size Photograph</h5>
          <ul class="text-muted">
            <li>Recent color photo with plain white background.</li>
            <li>JPEG or PNG format preferred.</li>
            <li>Face clearly visible — no hats, sunglasses, or shadows.</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h5 class="fw-semibold">3. Travel Itinerary / Flight Details</h5>
          <ul class="text-muted">
            <li>Proof of onward or return flight.</li>
            <li>Include applicant’s full name and travel dates.</li>
            <li>Confirmed e-ticket or reservation accepted.</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h5 class="fw-semibold">4. Accommodation Details</h5>
          <ul class="text-muted">
            <li>Hotel booking confirmation or invitation letter from host/family.</li>
            <li>Include address and contact details of accommodation provider.</li>
          </ul>
        </div>
      </div>

      <h5 class="mt-4 fw-semibold">5. Supporting Documents (if applicable)</h5>
      <ul class="text-muted">
        <li><strong>Business Visit:</strong> Invitation letter from local company or conference organizer.</li>
        <li><strong>Family Visit:</strong> Invitation letter and ID copy of host residing in the destination country.</li>
        <li><strong>Transit:</strong> Valid onward ticket to next destination.</li>
      </ul>

      <h3 class="mt-5 mb-3">How We Help</h3>
      <ul class="text-muted">
        <li>Review each document for clarity and accuracy.</li>
        <li>Ensure all files meet eTAS upload specifications.</li>
        <li>Contact applicants immediately if a document needs correction.</li>
        <li>Submit verified documents securely through the official eTAS system.</li>
      </ul>
      <p class="fw-bold">
        Our goal is to make the application process error-free, secure, and time-efficient for every applicant.
      </p>

      <!--<div class="alert alert-warning mt-4">-->
      <!--  <h5 class="fw-semibold">Important Notice</h5>-->
      <!--  <p>The Somalia eVisa is issued only by the Government of Somalia.</p>-->
      <!--  <p>eVisa Somali is a private consultancy, not affiliated with or endorsed by the Somali Government or any embassy.</p>-->
      <!--  <p>By using our service, you agree to pay an additional service fee for expert review, support, and assistance.</p>-->
      <!--</div>-->

    </div>
  </div>
</section>

<?php include 'footer.php';?>
<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>