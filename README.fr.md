# HangarExportJson

Extension légère, sans dépendance, pour exporter localement les véhicules candidats du hangar RSI en JSON. Cibles : Firefox, Chrome et Opera.

**Version expérimentale : tous les exports portent `complete: false`.** Le DOM actuel a été inspecté sur un vrai hangar avec autorisation, et l’extension installée a passé les tests Chromium sur données synthétiques. Un export réel avec l’extension installée et les essais Firefox/Opera restent à réaliser. Le résultat ne constitue pas un inventaire garanti.

[English README](README.md) · [Format JSON](docs/FORMAT.md) · [Confidentialité](docs/SECURITY.md) · [Validation et limites](docs/VALIDATION.md)

## Installation simple

[Téléchargez HangarExportJson 0.2.1](https://github.com/ussmarines/HangarExportJson/releases/download/v0.2.1/HangarExportJson-0.2.1.zip), puis décompressez le fichier. La [page de téléchargement](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.1) fournit aussi une empreinte SHA-256. Aucun outil de compilation ni installation npm n’est nécessaire. Dans le dossier extrait `HangarExportJson-0.2.1`, sélectionnez le sous-dossier **extension**.

Cette préversion expérimentale est destinée à une installation manuelle ; ce n’est pas un module signé distribué sur une boutique. Le téléchargement du code courant via **Code → Download ZIP** reste possible.

### Chrome

1. Ouvrez `chrome://extensions`.
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez le dossier `extension`.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges).

Cette installation reste normalement disponible après redémarrage si les fichiers restent en place. Les restrictions d’un navigateur administré peuvent empêcher ce chargement.

### Opera

1. Ouvrez `opera://extensions`.
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez `extension`.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges).

Opera partage le code Chromium. Son chargement réel n’a pas encore été testé : la compatibilité est une cible, pas une certification.

### Firefox

1. Ouvrez `about:debugging#/runtime/this-firefox`.
2. Cliquez sur **Charger un module complémentaire temporaire…**.
3. Sélectionnez `extension/manifest.json`.
4. Ouvrez ou rechargez [Mon hangar RSI](https://robertsspaceindustries.com/account/pledges). Si nécessaire, accordez l’accès à ce site uniquement.

**Le module disparaît au redémarrage de Firefox.** Une installation persistante sur Firefox standard exige une signature Mozilla, avec publication AMO ou distribution signée privée. Aucun XPI signé n’est fourni actuellement. Ne désactivez pas les protections du navigateur. La version minimale déclarée est Firefox 140 ; son exécution reste à vérifier.

## Utilisation

Connectez-vous à RSI normalement. Cliquez sur **Export my fleet as JSON** dans votre hangar. La collecte commence uniquement à ce clic, parcourt les pages successivement et demande le téléchargement d’un fichier `hangar-export-YYYY-MM-DD-HH-mm-ss.json` en heure UTC. Gardez cet onglet ouvert. **Cancel** annule sans télécharger.

Lisez les champs `warnings`, `unresolved` et `errors` et les informations affichées. Le navigateur peut demander une autorisation de téléchargement ; l’extension ne peut pas garantir que le fichier a été enregistré. L’interface reste en anglais.

La collecte repart de la première page sans les filtres de l’URL actuelle. Les pages identiques, erreurs réseau, limites ou structures inconnues arrêtent le parcours avec un rapport partiel. Un hangar apparemment vide est signalé comme ambigu, sans inventer une preuve de vacuité.

## Données et permissions

Un seul script limité aux pages HTTPS du hangar RSI. Aucune permission cookies, stockage, téléchargements, onglets ou accès global. Les lectures GET utilisent votre session normale sans extraire ses secrets. Aucune modification du compte.

Aucun serveur, publicité, télémétrie, service tiers, code distant ou transmission vers Juliet. Pas de collecte d’identifiants d’achat, prix, paiements, identité du compte ou dates d’achat. Les noms personnalisés peuvent être sensibles : vérifiez le fichier avant de le partager.

Les véhicules terrestres sont inclus lorsqu’un élément de véhicule est typé, même si RSI utilise le type `Ship` : la catégorie d’un élément direct reprend son libellé RSI et ne prouve pas qu’il vole ou roule. Les variantes restent distinctes et chaque exemplaire garde son nom personnalisé ou `null`. Aucune quantité n’est déduite d’un titre. Les upgrades non appliqués, peintures et équipements ne deviennent jamais des vaisseaux sur la seule base de leur titre. Les éléments inclus du pack avec upgrade inspecté présentent bien son modèle actuel ; la généralisation à tous les cas reste à qualifier.

## Véhicules inclus, sans remplaçants temporaires

La version **0.2.1**, au format JSON **2**, utilise une table locale sourcée pour les quatre véhicules secondaires confirmés par RSI : **85X** avec le 890 Jump, **Skylark** avec le Constellation Mk V Centaurus, **C8X Pisces Expedition et Ursa** avec la variante Carrack Expedition équipée du C8X. Seuls les modèles actuels et constructeurs correspondant exactement aux règles déclenchent cet ajout. Aucun catalogue n’est téléchargé. [Règles et sources officielles](docs/INCLUDED_VEHICLES.md).

Chaque exemplaire indique `source: "pledge"` ou `source: "included"`. Les inclusions gardent leurs parents dans `includedWith`, sans hériter de leur nom personnalisé. Selon la règle RSI actuelle, plusieurs parents ne multiplient pas un même véhicule secondaire. Les exemplaires achetés séparément restent distincts. En cas de recouvrement ambigu dans un même pack, l’extension signale `INCLUSION_OVERLAP` et n’ajoute pas d’exemplaire hypothétique. Les loaners de remplacement et d’Arena Commander ne sont pas ajoutés. La table reste limitée à ces parents, ce que le fichier signale explicitement.

## Désinstallation et développement

Un [contrat d’import natif pour Juliet](docs/JULIET_CONTRACT.md) et une [fixture entièrement synthétique](contracts/juliet-v2.synthetic.json) sont disponibles. L’adaptateur côté Juliet doit conserver les avertissements et demander une confirmation avant l’import partiel. Son ancien parseur de tableaux n’accepte pas encore cet objet ; aucun export de tableau supprimant les réserves n’a été ajouté ici.

La [revue de code 0.2.1](docs/CODE_REVIEW.md) documente les limites des boucles et le nettoyage des délais et écouteurs. Aucun travail de collecte n’est planifié au repos. Le regroupement et la détection des recouvrements utilisent des index en mémoire pour éviter les recherches répétées dans tout le hangar.

Supprimez HangarExportJson depuis le gestionnaire d’extensions. Les JSON déjà téléchargés doivent être supprimés séparément. Aucun stockage persistant n’est utilisé.

Pour les tests synthétiques uniquement, installez Node.js 22+ puis exécutez `npm test` à la racine. Pour les essais navigateur : `npm ci`, `npx playwright install chromium`, puis `npm run test:browser`. L’extension elle-même ne nécessite pas Node.js ni Playwright. Les preuves et prochaines étapes figurent dans [VALIDATION.md](docs/VALIDATION.md). Les références officielles et les détails techniques figurent dans le [README anglais](README.md).
