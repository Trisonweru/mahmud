<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PassKey Form Assist – Professional Form Filling & Document Support</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', sans-serif; }

    .hero {
      background: linear-gradient(135deg, #1a3a78 0%, #2d5fb3 100%);
      color: white;
      padding: 90px 0 80px;
    }

    .navbar { background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .navbar-brand { font-weight: 800; font-size: 1.3rem; color: #1a3a78 !important; }
    .nav-link { font-weight: 500; color: #333 !important; }
    .nav-link:hover { color: #1a3a78 !important; }

    .btn-primary { background: #1a3a78; border-color: #1a3a78; font-weight: 600; }
    .btn-primary:hover { background: #152d60; border-color: #152d60; }

    .feature-icon {
      width: 56px; height: 56px;
      background: rgba(26,58,120,0.1);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: #1a3a78;
      margin: 0 auto 14px;
    }

    .step-number {
      width: 42px; height: 42px;
      background: #1a3a78; color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem;
      margin: 0 auto 12px;
    }

    .price-card {
      border: 2px solid #1a3a78;
      border-radius: 16px;
      padding: 40px;
    }

    .trust-bar {
      background: #f0f4ff;
      border-radius: 12px;
      padding: 18px 24px;
    }

    footer { background: #1a3a78; color: rgba(255,255,255,0.8); padding: 40px 0 24px; }
    footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
    footer a:hover { color: #fff; }
    .footer-heading { color: #fff; font-weight: 700; margin-bottom: 14px; }

    .disclaimer {
      background: #fff8e1;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 6px;
      font-size: 0.88rem;
    }
  </style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg sticky-top">
  <div class="container">
    <a class="navbar-brand" href="#">
      <i class="bi bi-file-earmark-check me-2"></i>PassKey Form Assist
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><a class="nav-link" href="#how-it-works">How it works</a></li>
        <li class="nav-item"><a class="nav-link" href="#services">Services</a></li>
        <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
        <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
        <li class="nav-item ms-2">
          <a href="#pricing" class="btn btn-primary px-4">Get started</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="container text-center">
    <span class="badge bg-white text-primary fw-semibold mb-3 px-3 py-2" style="font-size:0.85rem;">
      Trusted Form Filing Assistance
    </span>
    <h1 class="fw-bold mb-3" style="font-size:2.8rem;">We Handle the Paperwork.<br>You Focus on What Matters.</h1>
    <p class="lead mb-4 col-lg-7 mx-auto" style="opacity:0.9;">
      PassKey Form Assist is a professional service that helps individuals accurately complete, review, and submit official forms and applications — saving you time and reducing costly errors.
    </p>
    <div class="d-flex gap-3 justify-content-center flex-wrap">
      <a href="#pricing" class="btn btn-light btn-lg px-5 fw-bold text-primary">Start your application</a>
      <a href="#how-it-works" class="btn btn-outline-light btn-lg px-5">Learn more</a>
    </div>
    <div class="mt-4 small" style="opacity:0.75;">
      <i class="bi bi-shield-check me-1"></i> Secure &amp; confidential &nbsp;·&nbsp;
      <i class="bi bi-clock me-1"></i> Fast turnaround &nbsp;·&nbsp;
      <i class="bi bi-headset me-1"></i> Dedicated support
    </div>
  </div>
</section>

<!-- Trust bar -->
<section class="py-4 bg-white border-bottom">
  <div class="container">
    <div class="row g-3 justify-content-center text-center">
      <div class="col-6 col-md-3">
        <div class="trust-bar h-100">
          <i class="bi bi-shield-lock-fill text-primary fs-4"></i>
          <p class="mb-0 fw-semibold mt-2 small">SSL Encrypted</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="trust-bar h-100">
          <i class="bi bi-person-check-fill text-primary fs-4"></i>
          <p class="mb-0 fw-semibold mt-2 small">Expert Review</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="trust-bar h-100">
          <i class="bi bi-lightning-charge-fill text-primary fs-4"></i>
          <p class="mb-0 fw-semibold mt-2 small">Fast Submission</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="trust-bar h-100">
          <i class="bi bi-headset text-primary fs-4"></i>
          <p class="mb-0 fw-semibold mt-2 small">24/7 Support</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Services -->
<section id="services" class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">What We Help With</h2>
      <p class="text-muted col-lg-6 mx-auto">We assist with a wide range of official forms and applications — ensuring accuracy, completeness, and timely submission.</p>
    </div>
    <div class="row g-4">
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-file-earmark-person"></i></div>
          <h5 class="fw-semibold">Official Form Completion</h5>
          <p class="text-muted small">We carefully complete official forms on your behalf, checking every field for accuracy and compliance.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-file-earmark-check"></i></div>
          <h5 class="fw-semibold">Document Preparation</h5>
          <p class="text-muted small">We review your supporting documents and ensure they meet all requirements before submission.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-send-check"></i></div>
          <h5 class="fw-semibold">Secure Submission</h5>
          <p class="text-muted small">Once verified, we submit your completed application through the correct official channel on your behalf.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-chat-dots"></i></div>
          <h5 class="fw-semibold">Application Tracking</h5>
          <p class="text-muted small">We keep you updated throughout the process and notify you as soon as a decision is reached.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-translate"></i></div>
          <h5 class="fw-semibold">Multilingual Support</h5>
          <p class="text-muted small">Our support team is available in multiple languages to ensure clear communication throughout.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="bg-white rounded-3 p-4 h-100 shadow-sm text-center">
          <div class="feature-icon"><i class="bi bi-arrow-repeat"></i></div>
          <h5 class="fw-semibold">Re-submission Assistance</h5>
          <p class="text-muted small">If your application is returned for corrections, we handle the re-submission promptly at no extra charge.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- How it works -->
<section id="how-it-works" class="py-5 bg-white">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">How It Works</h2>
      <p class="text-muted">Simple, transparent, and stress-free from start to finish.</p>
    </div>
    <div class="row g-4 justify-content-center">
      <div class="col-md-3 text-center">
        <div class="step-number">1</div>
        <h6 class="fw-semibold">Submit Your Details</h6>
        <p class="text-muted small">Complete our secure online intake form with your personal information and documents.</p>
      </div>
      <div class="col-md-3 text-center">
        <div class="step-number">2</div>
        <h6 class="fw-semibold">Expert Review</h6>
        <p class="text-muted small">Our team reviews your information for completeness and accuracy before proceeding.</p>
      </div>
      <div class="col-md-3 text-center">
        <div class="step-number">3</div>
        <h6 class="fw-semibold">We Submit For You</h6>
        <p class="text-muted small">We complete and submit your application to the appropriate authority on your behalf.</p>
      </div>
      <div class="col-md-3 text-center">
        <div class="step-number">4</div>
        <h6 class="fw-semibold">Stay Updated</h6>
        <p class="text-muted small">We notify you of progress and provide your confirmation as soon as it is available.</p>
      </div>
    </div>
  </div>
</section>

<!-- Pricing -->
<section id="pricing" class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Simple, All-Inclusive Pricing</h2>
      <p class="text-muted">One flat fee. No hidden charges. No surprises.</p>
    </div>
    <div class="row justify-content-center">
      <div class="col-lg-5 col-md-7">
        <div class="price-card text-center bg-white shadow-sm">
          <div class="display-4 fw-bold text-primary">£94</div>
          <div class="text-muted mt-1 mb-4">per application · all fees included</div>
          <ul class="list-unstyled text-start mb-4">
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Full form completion &amp; review</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Document verification</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Official submission on your behalf</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Application tracking &amp; updates</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Dedicated customer support</li>
            <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Re-submission at no extra cost</li>
          </ul>
          <a href="application" class="btn btn-primary btn-lg w-100 fw-bold">Start your application</a>
          <p class="text-muted small mt-3 mb-0">
            Secure payment via card · Refund available if we cannot submit your application
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Disclaimer -->
<section class="py-4 bg-white">
  <div class="container">
    <div class="col-lg-9 mx-auto">
      <div class="disclaimer">
        <strong>Important Notice:</strong> PassKey Form Assist is an independent private assistance service operated by PassKey Technologies Limited. We are not affiliated with, endorsed by, or acting on behalf of any government department or public authority. We do not guarantee outcomes — all final decisions are made solely by the relevant authority. Our fee covers preparation, review, and submission assistance only.
      </div>
    </div>
  </div>
</section>

<!-- Contact -->
<section id="contact" class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Get in Touch</h2>
      <p class="text-muted">Questions? Our team is ready to help.</p>
    </div>
    <div class="row g-4 justify-content-center">
      <div class="col-md-4 text-center">
        <i class="bi bi-envelope-fill text-primary fs-2 mb-3 d-block"></i>
        <h6 class="fw-semibold">Email</h6>
        <a href="mailto:support@evisasomali.com" class="text-decoration-none text-primary">support@evisasomali.com</a>
      </div>
      <div class="col-md-4 text-center">
        <i class="bi bi-whatsapp text-success fs-2 mb-3 d-block"></i>
        <h6 class="fw-semibold">WhatsApp</h6>
        <a href="https://wa.me/447957188411" class="text-decoration-none text-primary">+44 7957 188 411</a>
      </div>
      <div class="col-md-4 text-center">
        <i class="bi bi-geo-alt-fill text-primary fs-2 mb-3 d-block"></i>
        <h6 class="fw-semibold">Registered Office</h6>
        <p class="text-muted small mb-0">71–75 Shelton Street, Covent Garden<br>London WC2H 9JQ, United Kingdom</p>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="container">
    <div class="row g-4 mb-4">
      <div class="col-lg-4">
        <h5 class="footer-heading"><i class="bi bi-file-earmark-check me-2"></i>PassKey Form Assist</h5>
        <p class="small" style="opacity:0.75;">Professional form filling and document submission assistance for individuals. Fast, accurate, and confidential.</p>
      </div>
      <div class="col-lg-2 col-6">
        <h6 class="footer-heading">Service</h6>
        <ul class="list-unstyled small">
          <li class="mb-1"><a href="#services">What We Do</a></li>
          <li class="mb-1"><a href="#how-it-works">How It Works</a></li>
          <li class="mb-1"><a href="#pricing">Pricing</a></li>
        </ul>
      </div>
      <div class="col-lg-2 col-6">
        <h6 class="footer-heading">Legal</h6>
        <ul class="list-unstyled small">
          <li class="mb-1"><a href="terms">Terms of Service</a></li>
          <li class="mb-1"><a href="privacy">Privacy Policy</a></li>
          <li class="mb-1"><a href="refund_policy">Refund Policy</a></li>
        </ul>
      </div>
      <div class="col-lg-4">
        <h6 class="footer-heading">Contact</h6>
        <ul class="list-unstyled small">
          <li class="mb-1"><i class="bi bi-envelope me-2"></i><a href="mailto:support@evisasomali.com">support@evisasomali.com</a></li>
          <li class="mb-1"><i class="bi bi-whatsapp me-2"></i><a href="https://wa.me/447957188411">+44 7957 188 411</a></li>
          <li class="mb-1"><i class="bi bi-geo-alt me-2"></i>71–75 Shelton Street, London WC2H 9JQ</li>
        </ul>
      </div>
    </div>
    <hr style="border-color:rgba(255,255,255,0.15)">
    <div class="text-center small" style="opacity:0.6;">
      &copy; <script>document.write(new Date().getFullYear());</script> PassKey Technologies Limited · Company No. 16877709 · Registered in England &amp; Wales ·
      Private application assistance service · Not affiliated with any government authority
    </div>
  </div>
</footer>

<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>
