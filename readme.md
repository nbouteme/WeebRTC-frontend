WeebRTC Frontend
================

[Backend](https://github.com/nbouteme/WeebRTC)
[Demo live](https://wrtc.kuriyama.moe)

Partage de fichiers décentralisé sans stockage intermédiaire

Explication des choix
---------------------

Choix des technologies:
 - Typescript
	- Transpile vers ES5. 
	- Fortement et statiquement typé, donc offrant des garanties fortes sur le fonctionnement d'une application tout au long de son développement
- Vue.js
	- Framework frontend, moins connu que Angular/React
	- Simple d'utilisation, léger, sans opinion sur l'architecture de l'applicaion
	- Permet de déployer une SPA et déployer une PWA

Roadmap
-------

- [x] Serveur
	- [x] Génération de jetons
		- [x] Autoconnexion/Déconnexion
	- [x] Gestion de la connexion aux salles
		- [x] Autodéconnexion lors de la fermeture de session
	- [x] Communication dans une salle
	- [x] Service de fichiers statiques
- [ ] Client
	- [x] Échange de fichiers par WebRTC
		- [x] Protocole de signalement
		- [x] Échange de méta données
		- [x] Envoi de données
			- [x] Envoi non encrypté
			- [x] Envoi encrypté
		- [x] Réception de données
			- [x] Réception de fichiers non encrypté
			- [x] Réception de fichiers encrypté
	- [ ] Expérience utilisateur
		- [x] Internationalization
		- [ ] Gestion d'erreur
			- [x] Si l'utilisateur est hors-ligne
				- Désactiver l'interface et rediriger vers une page d'erreur
			- [ ] Si la WebSocket du serveur se ferme avant de trouver un pair (Tellement peu probable que c'est même pas la peine de gérer ce cas)
				- Raffraichir la page
			- [x] Afficher une erreur si :
				- [x] l'envoyeur ferme la connexion à n'importe quel point
				- [x] l'envoyeur ferme la connexion durant le transfert
				- [x] le receveur ferme la connexion à n'importe quel point
		- [x] Afficher/cacher des éléments selon l'étape dans le processus de partage
			- [x] Cacher l'entrée fichier si encryption séléctionnée et clé non valide
			- [x] Empêcher de modifier les options de transferts quand un fichier est selectionné
			- [x] Empêcher d'accepter un fichier tant qu'une clé valide n'a pas été entrée
			- [x] Empêcher l'envoyeur de changer le fichier jusqu'à la fin du transfert
		- [x] Répétabilité de l'échange
			- [x] Permettre de proposer un autre fichier en cas de refus
			- [x] Permettre de proposer un autre fichier après un transfert réussi

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
~~Si R ou S utilise un service TURN, un message d'avertissement est affiché pour les deux parties.~~ ~Impossible sans l'intervention du service TURN.~ Pourrait être possible, en regardant si le candidat est environ de type "relay" ("relayed" sur Firefox), mais nécessite une compréhension plus approfondie de ICE pour être plus précis dans la détection.

Lorsque S dépose un fichier, R est averti avec le nom du fichier et sa taille.
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

Problèmes de sécurité
---------------------

Le frontend fait aucun efforts pour valider les informations envoyées par un autre pair.

Le protocole d'échange se base sur un channel file et un channel data.
Les données sur le channel file sont exclusivement de type boolean et FileInfo.

Les boolean étant utilisé seulement dans des conditions, ils seront évalués selon la sémantique du langage, limitant leur utilité dans le cas d'un pair malveillant.

Les données de type FileInfo par contre, sont utilisé tel quel pour de l'affichage sanitizé, mais ne peuvent contenir de code exécutable, réduisant l'utilité
de l'exploiter en tant que vecteur d'attaque.

Sur le channel data, les données échangées sont strictement des ArrayBuffer, utiliser un type de données incompatible est ininteressant comme vecteur d'attaque.

En conclusion, l'exécution de code arbitraire est impossible, il reste une possibilité de faire afficher des informations invalides, mais impossible d'injecter des balises.