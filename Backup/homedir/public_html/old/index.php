<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fast, Secure & Stress-Free Online Travel Authorization</title>
    <link rel="icon" type="image/png" href="img/somalia_fav.jpg">

    <!-- Bootstrap 5.3 + Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Google Font: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <link href="css/style.css" rel="stylesheet">
<style>
    .hero {
        /* Blue overlay: navy blue (#1a3a78) with opacity */
        background: linear-gradient(rgba(26, 58, 120, 0), rgba(26, 58, 120, 0)), url('img/12494090-7a9f-41be-907c-7303f1a0dbad.jpg') center/cover no-repeat;
        color: white;
        padding: 100px 0;
    }
    .feature-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        height: 100%;
    }
    .feature-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.12);
    }
    .feature-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 126, 234, 0.15);
        border-radius: 12px;
        margin: 0 auto 16px;
        color: #667eea;
        font-size: 1.8rem;
    }
    .service-banner {
        background: linear-gradient(rgba(26, 58, 120, 0.3), rgba(26, 58, 120, 0.45)), url('img/maxresdefault_one.jpg') center/cover no-repeat;
        color: white;
        height: 100%;
    }
        .service-banner-one {
        background: linear-gradient(rgba(26, 58, 120, 0.3), rgba(26, 58, 120, 0.45)), url('img/compressed-1764105822965.jpg') center/cover no-repeat;
        color: white;
        height: 100%;
    }
        .service-banner-two {
        background: linear-gradient(rgba(26, 58, 120, 0.3), rgba(26, 58, 120, 0.45)), url('img/camel-in-a-desert-photo.jpg') center/cover no-repeat;
        color: white;
        height: 100%;
    }
        .service-banner-three {
        background: linear-gradient(rgba(26, 58, 120, 0.3), rgba(26, 58, 120, 0.45)), url('img/compressed-1764106486054.jpg') center/cover no-repeat;
        color: white;
        height: 100%;
    }
    
            .service-banner-four {
        background: linear-gradient(rgba(26, 58, 120, 0.3), rgba(26, 58, 120, 0.45)), url('img/compressed-1764218042834.jpg') center/cover no-repeat;
        color: white;
        height: 100%;
    }
    
    
    .btn-hero-primary {
        background: #667eea;
        border: none;
        font-weight: 600;
    }
    .btn-hero-primary:hover {
        background: #5a6fd8;
        transform: scale(1.03);
    }
    .text-glow {
        text-shadow: 0 2px 4px rgba(0,0,0,0.25);
    }
</style>
</head>
<body>
<?php 
$page = $_SERVER['HTTP_HOST'];
include 'header.php';
?>

<!-- Hero Section -->
<section class="hero text-center position-relative">
    <div class="container position-relative">
        <h1 class="fw-bold display-5 text-glow" style="font-size:2.8em">Apply for Your Travel Authorization</h1>
        <p class="lead mt-3">
            Secure ,Expert-Led Process.
        </p>

        <div class="mt-4">
            <a href="application" class="btn btn-hero-primary btn-lg px-5 me-3 text-white">Apply now</a>
        </div>
        
                <div class="mt-4">
            <b>Disclaimer:</b> Not affiliated with any government authority · Official site: <a href="https://etas.gov.so" target="blank">etas.gov.so</a>
        </div>
    </div>
</section>

<!-- Quick Action Cards -->
<!-- Floating Action Cards (Overlapping Hero) -->
<section class="py-0 bg-info bg-opacity-10" style="margin-top: -80px; position: relative; z-index: 3;">
  <div class="container">
    <div class="row g-4 justify-content-center">



      <!-- Apply for eVisa -->
        <div class="col-md-4">
          <div class="card border-0 rounded-4 shadow-lg h-100 position-relative overflow-hidden" 
               style="background: hsl(350, 50%, 95%); padding: 24px;"> <!-- visible background -->

            <!-- Pattern Overlay -->
            <svg class="position-absolute top-0 start-0 w-100 h-100"
                 style="z-index:0; opacity:0.14;" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="boxPatternMaroon" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="20" height="20" fill="hsl(350, 60%, 30%)" rx="3"/>
                  <rect x="22" y="22" width="20" height="20" fill="hsl(350, 60%, 30%)" rx="3"/>
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#boxPatternMaroon)"/>
            </svg>

            <div class="text-center position-relative" style="z-index:1;">
              <h3 class="fw-bold mb-2">Apply for eTAS</h3>
              <p class="text-muted small mb-3">Start your eTAS application in minutes.</p>
              <a href="application" class="btn btn-primary px-4 py-2 fw-semibold">Apply now</a>
            </div>
          </div>
        </div>




      <!-- Check Status -->
        <div class="col-md-4">
          <div class="card border-0 rounded-4 shadow-lg h-100 position-relative overflow-hidden" 
               style="background: hsl(185, 60%, 94%); padding: 24px;">

            <svg class="position-absolute top-0 start-0 w-100 h-100"
                 style="z-index:0; opacity:0.14;" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="boxPatternTeal" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="20" height="20" fill="hsl(185, 70%, 32%)" rx="3"/>
                  <rect x="22" y="22" width="20" height="20" fill="hsl(185, 70%, 32%)" rx="3"/>
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#boxPatternTeal)"/>
            </svg>

            <div class="text-center position-relative" style="z-index:1;">
              <h3 class="fw-bold mb-2">Check status</h3>
              <p class="text-muted small mb-3">Track your application in real time.</p>
              <a href="application_status" class="btn btn-primary px-4 py-2 fw-semibold">Check status</a>
            </div>
          </div>
        </div>



      <!-- Eligibility -->
        <div class="col-md-4">
          <div class="card border-0 rounded-4 shadow-lg h-100 position-relative overflow-hidden" 
               style="background: hsl(265, 55%, 95%); padding: 24px;">

            <svg class="position-absolute top-0 start-0 w-100 h-100"
                 style="z-index:0; opacity:0.14;" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="boxPatternPurple" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="20" height="20" fill="hsl(265, 65%, 35%)" rx="3"/>
                  <rect x="22" y="22" width="20" height="20" fill="hsl(265, 65%, 35%)" rx="3"/>
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#boxPatternPurple)"/>
            </svg>

            <div class="text-center position-relative" style="z-index:1;">
              <h3 class="fw-bold mb-2">Eligibility</h3>
              <p class="text-muted small mb-3">See if you qualify for the eTAS.</p>
              <a href="about" class="btn btn-primary px-4 py-2 fw-semibold">Learn more</a>
            </div>
          </div>
        </div>





    </div>
  </div>
</section>

<!-- Pricing Section -->
<section class="py-5 bg-info bg-opacity-10">
    <div class="container">
        <div class="row g-4 justify-content-center">
            <div class="col-lg-8 text-center">
                <a href="application" style="text-decoration:none!important;">
                <h2 class="fw-bold mb-3 text-muted">Transparent & Simple Pricing</h2>
                <p class="text-muted mb-4">
                     Your eTAS application is processed securely once submitted.
                </p>
                <div class="d-inline-block bg-light p-4 rounded-3 shadow-sm">
                    <div class="display-5 fw-bold text-primary mb-1">£94</div>
                    <div class="text-muted">Per application • Single entry • Valid up to 180 days</div>
                </div>
                </a>
            </div>
        </div>
    </div>
</section>

<!-- About + Services -->
<section class="py-5 bg-light">
    <div class="container">
        <div class="row g-4">
            <!-- About -->
            <div class="col-md-8">
                <div class="p-4 rounded-3 h-100 service-banner-four d-flex flex-column justify-content-between text-whote">
                    <h2 class="fw-bold mb-3">Your Trusted Application Support Partner</h2>
                    <p>We make application preparation easier with clear instructions, document review, and dedicated customer support.
                    Our goal is to help you submit your application with confidence and ease.</p>
                    <a href="application" class="btn btn-primary px-4 py-2">Apply now</a>
                </div>
            </div>

            <!-- Services -->
            <div class="col-md-4">
                <div class="p-4 rounded-3 h-100 service-banner d-flex flex-column justify-content-between">
                    <div>
                        <h2 class="fw-bold mb-3">Our services</h2>
                        <ul class="list-unstyled">
                            <li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i> Document prep & review</li>
                            <li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i> Step-by-step guidance</li>
                            <li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i> Fast processing options</li>
                            <li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i> 24/7 customer support</li>
                            <li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i> Secure data handling</li>
                        </ul>
                    </div>
                    <a href="application" class="btn btn-light px-4 py-2 fw-semibold mt-3">Apply now</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Action Tiles (Final CTA Section) -->
<section class="py-5">
  <div class="container">
    <div class="row g-4">
      <div class="col-md-4">
        <div class="p-4 rounded-3 h-100 service-banner-one d-flex flex-column justify-content-between text-center"
             style="min-height: 260px; background-color: #f8f9fa;">
          <h3 class="fw-bold mt-5">Start your application</h3>
          <a href="application" class="btn btn-primary px-4 py-2 fw-semibold">
            Apply now
          </a>
        </div>
      </div>

      <div class="col-md-4">
        <div class="p-4 rounded-3 h-100 service-banner-two d-flex flex-column justify-content-between text-center"
             style="min-height: 260px; background-color: #f8f9fa;">
          <h3 class="fw-bold mt-5">Application status</h3>
          <a href="application_status" class="btn btn-primary px-4 py-2 fw-semibold">
            Check status
          </a>
        </div>
      </div>

      <div class="col-md-4">
        <div class="p-4 rounded-3 h-100 service-banner-three d-flex flex-column justify-content-between text-center"
             style="min-height: 260px; background-color: #f8f9fa;">
          <h3 class="fw-bold mt-5">Learn More?</h3>
          <a href="about" class="btn btn-primary px-4 py-2 fw-semibold">
            Learn More
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<?php include 'footer.php'; ?>
<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>