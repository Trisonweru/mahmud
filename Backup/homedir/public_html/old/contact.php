<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact</title>
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
$page = 'contact';
include 'header.php';
?>

<section class="hero-about text-center py-8 text-white">
  <div class="container py-5">
    <h1 class="display-4 fw-bold" style="font-size:2.8em">Contact</h1>
  </div>
</section>

<!-- Contact Form Section -->
<section id="learn" class="py-5 bg-light">
  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <div class="card shadow-lg border-0 rounded-4 h-100">
          <div class="card-body p-5">
            <h2 class="fw-bold mb-4">Send us a message</h2>
            <form action="https://formspree.io/f/your-form-id" method="POST">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Full name <span class="text-danger">*</span></label>
                  <input type="text" name="name" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email address  <span class="text-danger">*</span></label>
                  <input type="email" name="email" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Phone (with country code)</label>
                  <input type="tel" name="phone" class="form-control" placeholder="+971...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Application reference (if any)</label>
                  <input type="text" name="reference" class="form-control" placeholder="e.g. SOM123456">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Subject <span class="text-danger">*</span></label>
                  <select name="subject" class="form-select" required>
                    <option value="">Choose...</option>
                    <option>Application Status</option>
                    <option>Document Help</option>
                    <option>Urgent/Rush Processing</option>
                    <option>Payment Issue</option>
                    <option>General Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Your message <span class="text-danger">*</span></label>
                  <textarea name="message" rows="5" class="form-control" placeholder="How can we assist you today?" required></textarea>
                </div>
                <div class="col-12">
                  <button type="submit" class="btn btn-primary px-4 py-2 fw-bold">
                    Send message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php include 'footer.php';?>
<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>