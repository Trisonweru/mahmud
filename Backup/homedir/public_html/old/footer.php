<style>
    .cookie-consent {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: #4189DD;
        color: #fff;
        padding: 15px 0;
        z-index: 9999;
        display: none;
    }

    .cookie-consent p {
        margin: 0;
        font-size: 15px;
    }

    /* Rectangular buttons: not square, not round */
    .cookie-consent .btn {
        border-radius: 4px !important;
        font-weight: 600;
        font-size: 14px;
        min-width: 120px;
        height: auto;
        padding: 8px 16px;
    }
</style>

<!-- Cookie Consent -->
<div id="cookieConsent" class="cookie-consent shadow-lg">
    <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between">
        <p class="mb-3 mb-md-0">
            We use cookies to improve your experience on our website. Some are essential (e.g., secure payments), while others help us understand how you use our services (analytics). We only use non-essential cookies with your permission. You can accept all cookies, reject non-essential ones, or manage your preferences. For more details, please read our <a href="privacy" class="text-white text-underline">Cookie Policy</a>.
        </p>
        <div class="d-flex gap-2 mt-2 mt-md-0">
            <button id="acceptAllCookies" class="btn btn-light px-3 py-2">Accept</button>
            <button id="rejectNonEssential" class="btn btn-outline-light px-3 py-2">Reject Non Essential</button>
        </div>
    </div>
</div>



<?php $hostname=$_SERVER['HTTP_HOST'];?>
    <footer>
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-5">
                    <h3 class="footer-title">
                                <a class="navbar-brand" href="../">
            <!--<img src="img/output-onlinepngtools.png" style="height:68px!important;">-->
        </a>
                    <p class="mt-5 fs-5">Apply online in minutes and unlock new destinations with ease</p>
                    <div class="mt-4">
                        <a href="#" class="social-icon"><i class="bi bi-twitter"></i></a>
                        <a href="#" class="social-icon"><i class="bi bi-facebook"></i></a>
                        <a href="#" class="social-icon"><i class="bi bi-instagram"></i></a>
                        <a href="#" class="social-icon"><i class="bi bi-github"></i></a>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 mb-4">
                    <h5 class="footer-title">Company</h5>
                    <div class="footer-links">
                        <a href="about">About</a>
                        <a href="application_status">Status</a>
                        <a href="faqs">FAQs</a>
                        <a href="documents">Documents</a>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 mb-4">
                    <h5 class="footer-title">Resources</h5>
                    <div class="footer-links">
                        <a href="application">Apply</a>
                        <a href="terms">Terms</a>
                        <a href="privacy">Privacy</a>
                        <a href="refund_policy">Refund Policy</a>
                    </div>
                </div>
                <div class="col-lg-4 col-md-4 mb-4">
                    <h5 class="footer-title">Stay Updated</h5>
                     <img src="img/verified-DbsUbfwp.jpg">
                </div>
            </div>
            <div class="copyright text-center">
                        <div class="col-sm-12">
                        
<div class="text-center">
&copy; </w><script>document.write(new Date().getFullYear()); </script> PassKey Technologies Limited. Company No. 16877709 · Registered in England &amp; Wales.
Registered office: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom. Private application assistance service · Not affiliated with any government authority · Official site: <a href="https://etas.gov.so" target="blank">etas.gov.so</a>. Legal: Privacy Policy · Terms of Service</p>
            </div>
            
            
        </div>
            </div>
        </div>
    </footer>

<script>
document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("cookieConsent")) {
        document.getElementById("cookieConsent").style.display = "block";
    }

    function saveConsent(consentValue) {
        localStorage.setItem("cookieConsent", consentValue);
        document.getElementById("cookieConsent").style.display = "none";
        // Optionally trigger cookie loading logic here based on consentValue
    }

    document.getElementById("acceptAllCookies").addEventListener("click", function () {
        saveConsent("all");
        // Here you could enable analytics, etc.
    });

    document.getElementById("rejectNonEssential").addEventListener("click", function () {
        saveConsent("essential-only");
        // Ensure only essential cookies (e.g., Stripe, session) are used
    });
});
</script>