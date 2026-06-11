const WA_NUMBER = "252613886027";
const WA_MESSAGE = encodeURIComponent("Hello, I need help with my eVisa application.");

export const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    style={{ backgroundColor: "#25D366" }}
  >
    <svg viewBox="0 0 32 32" fill="white" className="h-7 w-7" aria-hidden="true">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.463.644 4.775 1.77 6.785L2 30l7.43-1.746A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.845-1.6l-.418-.249-4.41 1.037 1.062-4.3-.274-.44A11.46 11.46 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.61c-.344-.172-2.037-1.005-2.353-1.12-.316-.114-.547-.172-.777.173-.23.344-.893 1.12-1.094 1.35-.2.23-.402.259-.746.086-.344-.172-1.452-.535-2.767-1.708-1.022-.912-1.712-2.038-1.913-2.382-.2-.344-.021-.53.151-.701.155-.155.344-.402.516-.603.172-.2.23-.344.344-.573.115-.23.058-.43-.029-.603-.086-.172-.777-1.873-1.065-2.563-.28-.673-.565-.582-.777-.592l-.662-.011c-.23 0-.603.086-.919.43-.316.344-1.208 1.18-1.208 2.878 0 1.697 1.237 3.337 1.409 3.566.172.23 2.435 3.718 5.9 5.213.824.356 1.467.568 1.969.727.827.263 1.58.226 2.174.137.663-.1 2.037-.832 2.323-1.635.287-.802.287-1.49.2-1.634-.086-.143-.315-.23-.66-.402z" />
    </svg>
  </a>
);
