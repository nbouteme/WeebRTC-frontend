WeebRTC Frontend
================

Partage de fichiers décentralisé sans stockage intermédiaire

Installation
------------

`npm i` puis `npm run build`, et servir le dossier dist

Dépendences
-----------

Typescript 3, Vue 2.5 pour le frontend.
Typescript 3 et Koa pour le backend.

Fonctionnement
--------------

Base:
	- Chaque onglet ne permet d'envoyer qu'un fichier à un pair.
	- L'onglet doit rester ouvert et actif jusqu'à la fin du transfert.
	- Si l'onglet est fermé avant la fin du téléchargement, le transfert est annulé et toute les données transférée jusque là sont perdues

Lors du chargement de la page, une série d'options sont d'abord proposés à l'utilisateur:
	- Deuxième couche de chiffrement AES-CBC, à utiliser dans le cas où un échange de clés plus fiable a eu lieu précédemment 
		[désactivée par défaut], l'utilisateur doit fournir une clé de 256 bits sous format hexadécimal (64 caractères).
	- Générer un ticket long ou court [long par défaut]

L'instance de navigateur envoyant un fichier est notée S, celle recevant le fichier est notée R, et le serveur noté C.

Les intéractions initiales du coté S sont les suivantes:
Le serveur génère un ticket unique identifiant le transfert et le transmet à S, ce ticket est valide jusqu'à ce que S ferme la websocket 
ou demande un nouveau ticket. Un nouveau ticket est demandé lorsque l'option controlant la longueur du ticket est changée.
S devient responsable de partager ce ticket de par ses propres moyens.

Les intéractions initiales du coté R sont les suivantes:
R possède un ticket de S obtenu de manière quelquonque.
R ouvre un websocket secure avec C et lui transmet le ticket.
C met en relation R et S.

Après la phase d'initialisation, S est libre de fermer la websocket. Le code actuel ferme la websocket avec le serveur pour les deux 
clients des qu'ils sont en relation l'un avec l'autre.

Les deux parties sont prévenues lorsque elles sont connectées ensemble.
~~Si R ou S utilise un service TURN, un message d'avertissement est affiché pour les deux parties.~~ Impossible sans l'intervention du service TURN.

Lorsque S dépose un fichier, R est avertie avec le nom du fichier et sa taille.
Si S a activé l'encryption, il est demandé à R d'entrer une clé. Si la clé est mauvaise, le fichier résultant sera incorrect.

Si R valide le fichier, le téléchargement commence. Voir section Téléchargement.
Pendant le téléchargement, le glissement de fichier est désactivé.
À la fin du téléchargement, S peut déposer un nouveau fichier, et les informations mises à jour seront reflétés du coté de R,
et la procédure peut reprendre autant de fois que nécessaire.

Téléchargement
--------------

Du coté de S, le fichier indiqué est coupé en blocs de 64k, et si l'option correspondante est activée, le fichier est encrypté avant 
cela. R détermine le nombre de blocs `n` auquel s'attendre à partir de la taille donnée plus tôt et se prépare à recevoir `n` messages,
ces messages sont assemblés puis décryptés.

Dues aux limitations de WebRTC, les transferts de fichiers se font par blocs de 64k, donc le débit peut-être sous-optimal, et les données
et sont cumulés dans la mémoire du navigateur, par manque de solutions de stockage facilement testable et cross-platform. L'application 
n'impose pas de limite par elle même, elle n'avertira donc pas l'utilisateur si un fichier est trop gros pour être transféré de manière 
fiable. La taille maximale recommandée est donc de 500Mo.
