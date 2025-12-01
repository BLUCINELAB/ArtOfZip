// Gestione invio form contatti
const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    console.log("antonzip.it contact →", data);

    alert("Messaggio inviato. Ti risponderò appena esco dalla sala di montaggio.");
    form.reset();
  });
}
