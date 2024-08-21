from telethon import TelegramClient, events, Button
import requests

# Inserisci le tue credenziali API
api_id = '26483422'
api_hash = '2677c9bb89c72714322e46e23ce8da0d'
bot_token = '6449467243:AAEiuSaOSd730J3mRWcXZy8PuVMIBvTYVXA'
admin_ids = [5492201619, 397303638, 1724635245, 7021428893]  # Inserisci gli ID degli admin

# Crea il client del bot
client = TelegramClient('bot', api_id, api_hash).start(bot_token=bot_token)

# Dizionario per tracciare le conversazioni
user_admin_mapping = {}
admin_user_mapping = {}

# Dizionario per tracciare le risposte degli utenti
user_responses = {}

# Lista di domande per la candidatura
questions = [
    "👨🏼‍🦰» 'Allora, come ti chiami?'",
    "👨🏼‍🦰» 'mhh, quanti anni hai?'",
    "👨🏼‍🦰» 'E quanto tempo sei disponibile per il lavoro?'",
    "👨🏼‍🦰» 'Dimmi un po'... dove hai lavorato fino a ora?'",
    "👨🏼‍🦰» 'Hai già maneggiato una pistola tra le mani?'",
    "👨🏼‍🦰» 'Raccontami chi sei, la tua storia e le tue intenzioni.'",
    "👨🏼‍🦰» 'Sai cos'è un'associazione criminale? E cosa cerchi da quest'ultima?'",
    "👨🏼‍🦰» 'Perché dovresti essere scelto tra tutti?'",
    "👨🏼‍🦰» 'Vuoi aggiungere altro?'"
]

# Funzione per inviare la candidatura al backend
async def send_application_to_backend(telegram_id, username, answers):
    url = 'http://eccari.chrifnite.it/api/candidature'  # URL del backend
    data = {
        "username": username,
        "telegramId": telegram_id,
        "answers": answers
    }
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("Candidatura inviata con successo.")
        else:
            print(f"Errore durante l'invio della candidatura: {response.status_code}")
            print(f"Risposta del server: {response.text}")
    except Exception as e:
        print(f"Errore durante la richiesta: {str(e)}")

# Comando /start
@client.on(events.NewMessage(pattern='/start'))
async def start(event):
    sender_id = event.sender_id
    if sender_id in user_admin_mapping:
        del user_admin_mapping[sender_id]  # Interrompe la conversazione con gli admin
    if sender_id in user_responses:
        del user_responses[sender_id]  # Cancella le risposte precedenti

    for admin_id in admin_ids:
        await client.send_message(admin_id, f"👤 Nuovo utente ha avviato una conversazione: <a href='tg://user?id={sender_id}'>{event.sender.first_name}</a> ({sender_id})", parse_mode='html')

    buttons = [
        [Button.inline('Parla con noi 🗣️', b'discorso_parla')],
        [Button.inline('Lavora per noi 💼', b'discorso_lavora')]
    ]
    message = (
    "Buongiorno 👋\n"
    "stai parlando con lo Scagnozzo dei Fratelli Eccari\n\n"

    "<b>Qui hai due scelte</b>, puoi decidere se <u>lavorare per loro</u> oppure <u>chiedere qualche informazione</u>, solo una cosa non cambia, lo devi dire a me...\n\n"

    "<tg-spoiler>Bot Developer @PippoScalia</tg-spoiler>"
    )

    await event.respond(message, buttons=buttons, parse_mode='html', link_preview=False)

# Gestione dei bottoni interattivi
@client.on(events.CallbackQuery)
async def callback(event):
    sender = await event.get_sender()
    sender_id = sender.id

    if event.data == b'discorso_parla':
        await event.respond(
            "<b>Tu:</b> Salve, cerco di fà passà 'nu messaggio ai fratelli, si può fa'?\n\n"
            "<b>Scagnozzo:</b> (guardandoti sospettoso) E chi si, fratè'? Io vendo pesce, mica facc 'o postin.\n\n"
            "<b>Tu:</b> o' sacc, scusamme. Ma è importante, mi hanno detto che qua posso trovare qualcuno ca mi può aiutà.\n\n"
            "<b>Scagnozzo:</b> (ridendo) Guarda 'sto guaglione! Vien ca e pensa ca po' parlà di ste cose accussì, senza manc na presentazione. Ma chi t' 'e cred' 'e essere?\n\n"
            "<b>Tu:</b> Sono un amico. 'N'amico d' 'n'amico, pe' dilla tutta. Ho solo bisogno di fa passà 'na parola, niente 'e cchiù.\n\n"
            "<b>Scagnozzo:</b> Uh maronna mij! ogni juorno spuntano sti pazzi. Tutti hann' 'na cosa urgente 'a dicere. Comme faccio a sapé ca nun staje cercanno 'e mettere 'o naso addò nun te chiammano?\n\n"
            "<b>Tu:</b> Capisco 'e preoccupazioni, è normale. Ma ti assicuro, nun sto ccà pe' fà casino. Stong ca p dir na cosa ai fratelli.\n\n"
            "<b>Scagnozzo:</b> E pecché propio a me? Cosa te fa penzà ca io posso parlà coi fratelli?\n\n"
            "<b>Tu:</b> Pecché staje ccà, no? E pecché 'e voci diceno ca si 'nu tipo 'e fiducia, uno ca sape fa' 'e cose per bene.\n\n"
            "<b>Scagnozzo:</b> Va buò, dimme stu messaggio. Ma fa' presto e parla chiaro, che nun tengo tutt' 'o juorno.",
            buttons=[[Button.inline('Inizia chat 💬', b'parla')]],
            parse_mode='html'
        )

    elif event.data == b'discorso_lavora':
        await event.respond(
            "<b>Tu:</b> Buongiorno, ho sentito che qui si trova il pesce più fresco di Napoli.\n\n"
            "<b>Pescivendolo:</b> Eh certo. Che te serve, 'o branzino o 'a spigola? Teng pure nu poc 'e cozz cca mo è periodo.\n\n"
            "<b>Tu:</b> In realtà non sono venuto per il pesce. Sono interessato a... altre opportunità.\n\n"
            "<b>Pescivendolo:</b> Uaglio', ij venn o pesc. Non so di che \"opportunità\" parli. Qui è tutto onesto, tutto legale.\n\n"
            "<b>Tu:</b> Capisco, però, sai, la voce gira. E la voce dice che forse c’è di più qui.\n\n"
            "<b>Pescivendolo:</b> E voc ca girn so tante, può essr ca nun so ver. Chi ti manda qui a parlare così?\n\n"
            "<b>Tu:</b> Nessuno mi manda. Sono venuto di mia iniziativa perché so che ci sono persone che apprezzano certe qualità.\n\n"
            "<b>Pescivendolo:</b> Azz, tua iniziativa? E che qualità sarebbero queste, eh? Qui a Napoli, nun ce cunt e pisciazz.\n\n"
            "<b>Tu:</b> Le qualità di uno che sa quando parlare e quando stare zitto.\n\n"
            "<b>Pescivendolo:</b> Eh si ok, ogni giorno ne arriv uno nuov. Tutti vogliono entrare, ma chist non è nu circo, lo capisci? Come faccio a sapere che non sei un problema?\n\n"
            "<b>Tu:</b> Perché non ho interesse a essere un problema. Ho interesse a essere una risorsa.\n\n"
            "<b>Pescivendolo:</b> (ancora non convinto) Ah, sì? E come posso fidarmi di te, eh? Napoli sta piena 'e guardie e ciandrielli.\n\n"
            "<b>Tu:</b> Guarda, la fiducia si guadagna, vero? Dammi un'opportunità e ti dimostrerò di che pasta sono fatto.\n\n"
            "<b>Pescivendolo:</b> Va bene, vediamo cosa sai fare. Rispondi alle seguenti domande:",
            buttons=[[Button.inline('Inizia candidatura 📋', b'lavora')]],
            parse_mode='html'
        )

    elif event.data == b'parla':
        user_admin_mapping[sender_id] = admin_ids  # Associa tutti gli admin all'utente
        await event.respond(
            "<b>Scagnozzo:</b> Va buò, dimme stu messaggio. Ma fa' presto e parla chiaro, che nun tengo tutt' 'o juorno.",
            buttons=[Button.inline('Termina chat', b'start')],
            parse_mode='html'
        )

    elif event.data == b'lavora':
        user_responses[sender_id] = {"answers": [], "current_question": 0}
        await client.send_message(sender_id, questions[0], parse_mode='html')

# Inoltro dei messaggi degli utenti agli admin
@client.on(events.NewMessage)
async def forward_to_admin(event):
    sender_id = event.sender_id

    if sender_id in user_admin_mapping:
        sender = await event.get_sender()
        for admin_id in admin_ids:  # Invia il messaggio a tutti gli admin
            forwarded_message = await client.send_message(
                admin_id,
                f"📩 <b>Messaggio da</b> <a href='tg://user?id={sender.id}'>{sender.first_name}</a>:\n\n{event.message.message}",
                parse_mode='html'
            )
            admin_user_mapping[forwarded_message.id] = sender_id

        buttons = [Button.inline('Torna allo start 🏠', b'start')]
        await event.respond("✅ <b>Messaggio inviato</b>", buttons=buttons, parse_mode='html')

    elif sender_id in user_responses:
        responses = user_responses[sender_id]
        responses["answers"].append(event.message.message)
        responses["current_question"] += 1

        if responses["current_question"] < len(questions):
            await event.respond(questions[responses["current_question"]], parse_mode='html')
        else:
            summary = (
                f"📄 <b>Modulo candidatura:</b>\n\n"
                f"👤 <b>Nickname:</b> <a href='tg://user?id={sender_id}'>{responses['answers'][0]}</a>\n"
                f"🆔 <b>ID:</b> {sender_id}\n"
                f"🗓️ <b>Età:</b> {responses['answers'][1]}\n"
                f"⌛ <b>Attività giornaliera:</b> {responses['answers'][2]}\n"
                f"🔫 <b>Esperienze Lavorative:</b> {responses['answers'][3]}\n"
                f"📖 <b>Esperienze Criminali:</b> {responses['answers'][4]}\n"
                f"📜 <b>Presenta il tuo personaggio roleplay:</b> {responses['answers'][5]}\n"
                f"❓ <b>Cosa cerchi in un'associazione criminale?:</b> {responses['answers'][6]}\n"
                f"🔍 <b>Perché scegliere proprio te?:</b> {responses['answers'][7]}\n"
                f"📝 <b>Informazioni aggiuntive:</b> {responses['answers'][8]}"
            )

            for admin_id in admin_ids:  # Invia il modulo a tutti gli admin
                await client.send_message(admin_id, summary, parse_mode='html')
            
            # Invio della candidatura al backend
            username = event.sender.username or event.sender.first_name or "Anonimo"
            await send_application_to_backend(telegram_id=sender_id, username=username, answers=responses["answers"])

            del user_responses[sender_id]  # Cancella le risposte dopo l'invio

            buttons = [Button.inline('Torna allo start 🏠', b'start')]
            await event.respond("✅ <b>Modulo inviato ai fratelli, verrai contattato a breve</b>", buttons=buttons, parse_mode='html')

    elif event.data == b'torna_indietro':
        if sender_id in user_responses:
            del user_responses[sender_id]  # Cancella le risposte

        buttons = [Button.inline('Torna allo start 🏠', b'start')]
        await event.respond("⚠️ <b>Modulo cancellato</b>", buttons=buttons, parse_mode='html')

# Inoltro delle risposte degli admin agli utenti
@client.on(events.NewMessage)
async def forward_to_user(event):
    if event.is_reply and event.sender_id in admin_ids:
        replied_message = await event.get_reply_message()
        if replied_message.id in admin_user_mapping:
            original_user_id = admin_user_mapping[replied_message.id]
            await client.send_message(
                original_user_id,
                f"📩 <b>Risposta da uno dei fratelli:</b>\n\n{event.message.message}",
                parse_mode='html'
            )

# Gestione del bottone "Torna allo start"
@client.on(events.CallbackQuery)
async def on_torna_allo_start(event):
    if event.data == b'start':
        sender_id = event.sender_id
        if sender_id in user_admin_mapping:
            del user_admin_mapping[sender_id]  # Interrompe la conversazione con gli admin
        if sender_id in user_responses:
            del user_responses[sender_id]  # Cancella le risposte precedenti

        await start(event)

# Avvia il client
client.start()
client.run_until_disconnected()
