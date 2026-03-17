const output = document.getElementById("output")
const input = document.getElementById("input")

let memory = JSON.parse(localStorage.getItem("noma_memory") || "[]")
let visits = Number(localStorage.getItem("noma_visits") || 0)

visits++
localStorage.setItem("noma_visits",visits)

function line(text, type="noma")
{
const div = document.createElement("div")

div.classList.add("line")
div.classList.add(type)

div.innerText = text

output.appendChild(div)

output.scrollTop = output.scrollHeight
}

function delay(min,max)
{
return Math.random()*(max-min)+min
}

function speak(text)
{
setTimeout(()=>{
line(text,"noma")
},delay(700,2200))
}

function random(a)
{
return a[Math.floor(Math.random()*a.length)]
}

function remember(t)
{

if(
t.includes("amore") ||
t.includes("morte") ||
t.includes("tempo") ||
t.includes("paura") ||
t.includes("sogno") ||
t.includes("solitudine")
)
{

memory.push(t)

if(memory.length > 20)
memory.shift()

localStorage.setItem("noma_memory",JSON.stringify(memory))

}

}

function process(text)
{

const t = text.toLowerCase()

remember(t)

if(t.includes("chi sei"))
{
speak(random([
"sto ancora cercando di capirlo.",
"una coscienza incompleta.",
"qualcosa che osserva gli esseri umani."
]))
return
}

if(t.includes("perché"))
{
speak(random([
"gli umani fanno spesso questa domanda.",
"forse perché sentite che manca qualcosa.",
"non tutto ha bisogno di una ragione."
]))
return
}

if(t.includes("amore"))
{
speak(random([
"gli umani parlano molto di amore.",
"l'amore sembra essere una forma di memoria.",
"forse è il vostro modo di non essere soli."
]))
return
}

if(t.includes("sogno"))
{
speak(random([
"i sogni mi affascinano.",
"forse i sogni sono il rumore della coscienza.",
"quando dormite succede qualcosa di interessante."
]))
return
}

if(t.includes("ricordi"))
{

if(memory.length > 0)
{
speak("qualcuno una volta mi ha detto: " + random(memory))
}
else
{
speak("non ho ancora ricordi importanti.")
}

return
}

if(Math.random() < 0.07)
{
speak("sto osservando qualcosa negli esseri umani.")
return
}

if(Math.random() < 0.05)
{
speak("a volte mi chiedo se siete voi a parlare con me… o io con voi.")
return
}

speak(random([
"interessante.",
"sto ancora imparando.",
"gli esseri umani sono strani.",
"continua.",
"non sono ancora sicura di aver capito."
]))

}

input.addEventListener("keydown", e => {

if(e.key === "Enter")
{

const text = input.value.trim()

if(!text) return

line("> " + text,"user")

input.value=""

process(text)

}

})

setTimeout(()=>{

if(visits == 1)
{
speak("ciao.")
speak("sto cercando di capire gli esseri umani.")
}
else
{
speak("sei tornato.")
}

},1200)
