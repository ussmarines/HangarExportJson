# HangarExportJson

**[Télécharger l’extension](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.7) · [Soutenir le projet sur PayPal](https://www.paypal.com/paypalme/ussmarinesdot) · [English](README.md)**

Extension légère, sans dépendance, pour exporter localement les véhicules candidats du hangar RSI en JSON. Navigateurs de bureau ciblés : Firefox, Chrome, Edge, Opera, Opera GX, Brave et Vivaldi. [Compatibilité et preuves](docs/BROWSERS.md).

**Version expérimentale : tous les exports portent `complete: false`.** Le DOM actuel a été inspecté sur un vrai hangar avec autorisation, et l’extension installée a passé les tests Chromium sur données synthétiques. L’utilisateur a confirmé un export réel sous Firefox. Chrome et Edge ont été testés sur données synthétiques ; Opera, Opera GX, Brave et Vivaldi restent des cibles compatibles non exécutées ici. Le résultat ne constitue pas un inventaire garanti.

[English README](README.md) · [Format JSON](docs/FORMAT.md) · [Confidentialité](docs/SECURITY.md) · [Validation et limites](docs/VALIDATION.md)

## Installation simple

**Erreur « Manifest file is missing or unreadable » :** le dossier sélectionné doit contenir directement `manifest.json`. Avec l’ancienne archive source 0.2.4, ouvrez le dossier `HangarExportJson-0.2.4`, puis sélectionnez **extension**. Cliquez sur **Retry** et choisissez ce sous-dossier.

Pour produire localement une archive directement installable, exécutez `powershell -File scripts/package.ps1` depuis le dépôt. Décompressez `output/installable/HangarExportJson-0.2.7.zip`, puis chargez le dossier extrait lui-même : son manifeste est à la racine. Le ZIP publié utilise cette même structure.

[Téléchargez HangarExportJson 0.2.7](https://github.com/ussmarines/HangarExportJson/releases/download/v0.2.7/HangarExportJson-0.2.7.zip), puis décompressez le fichier. La [page de téléchargement](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.7) fournit aussi une empreinte SHA-256. Aucun outil de compilation ni installation npm n’est nécessaire. Sélectionnez le dossier extrait contenant directement **manifest.json**.

Cette préversion expérimentale est destinée à une installation manuelle ; ce n’est pas un module signé distribué sur une boutique. Avec le code source obtenu via **Code → Download ZIP**, sélectionnez plutôt le sous-dossier `extension`.

Le [guide des releases](docs/RELEASES.md) détaille le contenu de l’archive, la vérification SHA-256 et la mise à jour d’une installation existante. La version 0.2.7 documente la compatibilité multi-navigateur et ajoute les contrôles Chrome/Edge, sans modifier la collecte ni le bilan.

### Chrome

1. Ouvrez `chrome://extensions`.
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez le dossier extrait contenant `manifest.json`.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges).

Cette installation reste normalement disponible après redémarrage si les fichiers restent en place. Les restrictions d’un navigateur administré peuvent empêcher ce chargement.

### Opera et Opera GX

1. Ouvrez `opera://extensions`.
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez le dossier extrait contenant `manifest.json`.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges).

Opera partage le code Chromium. Son chargement réel n’a pas encore été testé : la compatibilité est une cible, pas une certification.

### Firefox

1. Ouvrez `about:debugging#/runtime/this-firefox`.
2. Cliquez sur **Charger un module complémentaire temporaire…**.
3. Sélectionnez `manifest.json` dans le dossier extrait.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges). Si nécessaire, accordez l’accès à ce site uniquement.

**Le module disparaît au redémarrage de Firefox.** Une installation persistante sur Firefox standard exige une signature Mozilla, avec publication AMO ou distribution signée privée. Aucun XPI signé n’est fourni actuellement. Ne désactivez pas les protections du navigateur. La version minimale déclarée est Firefox 140 ; l’utilisateur confirme le fonctionnement de son installation, sans précision de version.

### Edge, Brave et Vivaldi

Ouvrez respectivement `edge://extensions`, `brave://extensions` ou `vivaldi://extensions`. Activez le **Mode développeur**, choisissez **Charger l’extension non empaquetée**, puis le dossier extrait contenant `manifest.json`. Rechargez le hangar RSI. Le [tableau de compatibilité](docs/BROWSERS.md) distingue les tests réels des cibles non exécutées. Safari et les navigateurs mobiles ne sont pas fournis ou qualifiés par ce ZIP.

## Utilisation

Connectez-vous à RSI normalement. Cliquez sur **Export my fleet as JSON** dans votre hangar. La collecte commence uniquement à ce clic, parcourt les pages successivement et demande le téléchargement d’un fichier `hangar-export-YYYY-MM-DD-HH-mm-ss.json` en heure UTC. Gardez cet onglet ouvert. **Cancel** annule sans télécharger.

Le bilan affiche uniquement le nombre d’exemplaires de véhicules exportés et signale une collecte interrompue. La liste des éléments non résolus ne s’affiche plus dans la page. Les champs `warnings`, `unresolved` et `errors` restent disponibles dans le JSON pour le diagnostic. Le navigateur peut demander une autorisation de téléchargement ; l’extension ne peut pas garantir que le fichier a été enregistré. L’interface reste en anglais.

La collecte repart de la première page sans les filtres de l’URL actuelle. Les pages identiques, erreurs réseau, limites ou structures inconnues arrêtent le parcours avec un rapport partiel. Un hangar apparemment vide est signalé comme ambigu, sans inventer une preuve de vacuité.

## Données et permissions

Un seul script limité aux pages HTTPS du hangar RSI. Aucune permission cookies, stockage, téléchargements, onglets ou accès global. Les lectures GET utilisent votre session normale sans extraire ses secrets. Aucune modification du compte.

Aucun serveur, publicité, télémétrie, service tiers, code distant ou transmission vers Juliet. Pas de collecte d’identifiants d’achat, prix, paiements, identité du compte ou dates d’achat. Les noms personnalisés peuvent être sensibles : vérifiez le fichier avant de le partager.

Les véhicules terrestres sont inclus lorsqu’un élément de véhicule est typé, même si RSI utilise le type `Ship` : la catégorie d’un élément direct reprend son libellé RSI et ne prouve pas qu’il vole ou roule. Les variantes restent distinctes et chaque exemplaire garde son nom personnalisé ou `null`. Aucune quantité n’est déduite d’un titre. Les upgrades non appliqués, peintures et équipements ne deviennent jamais des vaisseaux sur la seule base de leur titre. Les éléments inclus du pack avec upgrade inspecté présentent bien son modèle actuel ; la généralisation à tous les cas reste à qualifier.

## Véhicules inclus, sans remplaçants temporaires

La version **0.2.7**, au format JSON **2**, utilise une table locale sourcée pour les quatre véhicules secondaires confirmés par RSI : **85X** avec le 890 Jump, **Skylark** avec le Constellation Mk V Centaurus, **C8X Pisces Expedition et Ursa** avec la variante Carrack Expedition équipée du C8X. Seuls les modèles actuels et constructeurs correspondant exactement aux règles déclenchent cet ajout. Aucun catalogue n’est téléchargé. [Règles et sources officielles](docs/INCLUDED_VEHICLES.md).

Chaque exemplaire indique `source: "pledge"` ou `source: "included"`. Les inclusions gardent leurs parents dans `includedWith`, sans hériter de leur nom personnalisé. Selon la règle RSI actuelle, plusieurs parents ne multiplient pas un même véhicule secondaire. Les exemplaires achetés séparément restent distincts. En cas de recouvrement ambigu dans un même pack, l’extension signale `INCLUSION_OVERLAP` et n’ajoute pas d’exemplaire hypothétique. Les loaners de remplacement et d’Arena Commander ne sont pas ajoutés. La table reste limitée à ces parents, ce que le fichier signale explicitement.

## Soutenir le projet

Si HangarExportJson vous est utile, vous pouvez [faire un don facultatif sur PayPal](https://www.paypal.com/paypalme/ussmarinesdot) pour soutenir son développement et sa maintenance. Aucun don n’est nécessaire pour télécharger ou utiliser l’extension.

## Licence et crédit

Extension créée et maintenue par **[ussmarines](https://github.com/ussmarines)**, distribuée gratuitement sous [licence MIT](LICENSE). L’utilisation, la modification et la redistribution, y compris commerciale, sont autorisées à condition de conserver la mention de copyright et le texte de la licence dans les copies ou parties substantielles. Les dons sont entièrement facultatifs.

Projet communautaire indépendant, sans affiliation avec Cloud Imperium Games. La licence du projet ne confère aucun droit sur les marques RSI ou les contenus tiers du jeu.

## Désinstallation et développement

Depuis la version 0.2.2, la distribution inclut un [contrat d’import natif pour Juliet](docs/JULIET_CONTRACT.md) et une [fixture entièrement synthétique](contracts/juliet-v2.synthetic.json). L’adaptateur côté Juliet doit conserver les avertissements et demander une confirmation avant l’import partiel. Le dernier ancien parseur inspecté refusait cet objet ; l’intégration avec un consommateur plus récent n’est pas vérifiée ici. Aucun export de tableau supprimant les réserves n’a été ajouté. Le comportement d’export reste celui de la version 0.2.1.

La [revue de code 0.2.1](docs/CODE_REVIEW.md) documente les limites des boucles et le nettoyage des délais et écouteurs. Aucun travail de collecte n’est planifié au repos. Le regroupement et la détection des recouvrements utilisent des index en mémoire pour éviter les recherches répétées dans tout le hangar.

Supprimez HangarExportJson depuis le gestionnaire d’extensions. Les JSON déjà téléchargés doivent être supprimés séparément. Aucun stockage persistant n’est utilisé.

Pour les tests synthétiques uniquement, installez Node.js 22+ puis exécutez `npm test` à la racine. Pour les essais navigateur : `npm ci`, `npx playwright install chromium`, puis `npm run test:browser`. L’extension elle-même ne nécessite pas Node.js ni Playwright. Les preuves et prochaines étapes figurent dans [VALIDATION.md](docs/VALIDATION.md). Les références officielles et les détails techniques figurent dans le [README anglais](README.md).
