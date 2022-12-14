"Martin Technologies | Lookup | Weezr"

- re-tester pagination
- bug websocket new message !!!

- Mette shadow sur texte in grid.
- Use react-native-haptic-feedback at refreshControl + onRefresh

- UserInteractions => handle "replies too" in TabNotificationsCenter
- Query (Apollo ?) => See why we pass many times in some queries (like users)
- Fix realtime when create new message at new thread
- Fix forward photo in user detail
- Fix tab unread message => not work at update
- Fix websocket count unread messages in users grid, sometime stay at 0 
- Change wording in back-end by keys of trad
- Android => 
  - Very slow on device !!
  - Bug, no pagination (on grid)
  - Bug, no profile me on all grid
- Refaire algo pour les hommes -> afficher pareil

1) Refacto Inputs (and handle fields errors)
  - Text | textArea                       => <Form.Item type="text" /> (ou <Input type="text | textArea | password" />)
  - Select | Wheel | Radio | Checkbox     => <Picker type="checkbox" canMultipleSelect={bool} data={[]} />   (ex: if type="date" => automatically in modal | if type="checkbox" => automatically in inline)
2) Settings - check if email doesn't exist before save + handle fields errors

* Finir settings
  - Use WatermelonDB for some fields => { key: String, value: Boolean | Any, userId: String } => settings.find({ key: 'enabledNotifications', userId: userMeId })
  - Radio (Picker) (h/f)
  - Wheel (Picker) => https://wix.github.io/react-native-ui-lib
  - Slider (age range)
  - 'isOnline' => changer le champ en 'account': { 'lastLoginAt': Date, 'lastActivityAt': Date } => ajouter une icon orange (si lastActivityAt > 15min = on passe en orange, si > 30min, on vire l'icon)
  - send websockets every 15 minutes for update user's location in grid

* mapbox.com
* Push notification
* Dark mode

- Créer un composent générique pour les vues (pageInfo, isLoading, haveError)
- Handle delete file on cloud
- I18N:
  - km/miles
  - formats de dates et heures (MomentJs (apparemment mongoDB formate les dates en type '767267627637'))
- Toast
- Vérifier le rendu des emojis sur Android
- splashscreen
- react-native-swipe-list-view sur les items list
* Improvement authentication + { SMS OTP | SMS gateway | send token via mail || lien cliquable via mail || captcha} + remove AsyncStorage.getItem()
- refacto pour generiser InputText & InputTextArea ?
- Convention name "data" => "dataGql"
- MEP:
  => IOS: 'Info.plist' file must contain a NSXxxDescription with a user-facing purpose string explaining clearly and completely why your app needs the location, otherwise Apple will reject your app submission
- refacto gql - remove CustomXxx, everywhere
- Block => implem limit to block (ex 200)
- Si bug gesture sur Android, voir https://docs.swmansion.com/react-native-gesture-handler/docs/installation/#android
- Handle when user deleted account

- Gallery photos => enable multiple select + send photos
- ThreadDetail => enable multiple participants in thread (>= 3)
- Make the Markers move smoothly in react-native-maps
- Créer automation (Cron) afin de supprimer toutes les interactions des visiteurs de plus de 7j. Pour faire de la place en bbd.
- Send event websocket when ignoredMessages (for good update seen message)
- Chat => https://github.com/FaridSafi/react-native-gifted-chat/blob/22cc6f70045c2755a4bec6e1e87ce788d7166a8f/example/example-gifted-chat/src/Chats.js

* Create static website + RGPD + privacy
* Create logo

Authent JWT :
1) login / signup              ( SET token in local ) + get data userMe
2) get data profile             ( GET token in local => with ApolloJs or raw Authorization: `JWT ${token}` )
3) get data (posts, users...)  ( GET token in local => with ApolloJs or raw Authorization: `JWT ${token}` )


# ------------ NOTES ------------
- joinThreads, leaveThreads à mettre dans useFocusEffect (tous)
- pagination => Offset-based pagination with ApolloJs
- Websocket - newThread => Bug potentiel du au fait qu'on "join le room" apres avoir "send un message"
- use onCompleted() of Apollo Get


# ------------ USER INTERACTIONS ------------
- 'UserInterSendLike':
  - { senderId: '111', receiverId: '222', at: 'Date', type: '💛 | 🔥', isMutual: boolean }
  - { senderId: '222', receiverId: '111', at: 'Date', type: '💛 | 🔥', isMutual: boolean }
    => For display my heart list : UserInterSendLike.Find({ receiverId: userMe?.id }).populate('senderId')

- 'UserInterFollow':
  - { senderId: '111', receiverId: '222', at: 'Date' }
    => For display my followed list : UserInterFollow.Find({ senderId: userMe?.id }).populate('receiverId')
    => For display my follower list : UserInterFollow.Find({ receiverId: userMe?.id }).populate('senderId')

- 'UserInterBlock':
  - { senderId: '111', receiverId: '222', at: 'Date' }
    => For display my block list : UserInterBlock.Find({ senderId: userMe?.id }).populate('receiverId')


# ------------ SETTINGS ------------
- rassembler les champs de types 'text' entre eux
- utiliser le flatList partout (en standard et en custom)
- faire simple = utiliser toujours le même design (boutons radio / checkbox + une wheel) et c'est tout


- Tab "User Grid" => changer en "Parcourir / Browse"
- S'inspirer de Badoo (++) et Happen (+++)
- Mettre des clés de trads pour les champs de type select

- Mettre les composents de settings dans un folder
  - "screens/UserSpaceMenu/TabUserSpaceMenuScreen.tsx"
  - 
  - "screens/UserSpaceMenu/UserEditingProfile/UserEditingProfileMenuScreen.tsx"
  - "screens/UserSpaceMenu/UserPreferences/UserPreferencesMenuScreen.tsx"
  - 
  - "screens/UserSpaceMenu/UserAccountSettings/UserAccountSettingsMenuScreen.tsx"
  - "screens/UserSpaceMenu/UserAccountSettings/subMenu/UserNotificationsMenuScreen.tsx"
  - "screens/UserSpaceMenu/UserAccountSettings/subMenu/UserPrivacyMenuScreen.tsx"
  - "screens/UserSpaceMenu/UserAccountSettings/subMenu/UserAccountMenuScreen.tsx"
  - "screens/UserSpaceMenu/UserAccountSettings/subMenu/LegalMenuScreen.tsx"
  - 
  - "screens/UserSpaceMenu/HelpSupport/HelpSupportMenuScreen.tsx"
  - "screens/UserSpaceMenu/HelpSupport/subMenu/HelpMenuScreen.tsx"
  - "screens/UserSpaceMenu/HelpSupport/subMenu/ContactMenuScreen.tsx"
  - 
  - "screens/UserSpaceMenu/Premium/PremiumMenuScreen.tsx"


- "screens/UserSpaceFieldsForm/DisplayNameFieldFormScreen.tsx"
- "screens/UserSpaceFieldsForm/AboutMeFieldFormScreen.tsx"

------ Menu du profil / User profile menu ------ (UserSpaceMenu) (icon "profil")
# 1
(avatar) => Voir le profil / See profile

-> Modifier le profil / Edit the profile
  - Modifier les informations de votre profil / Edit your profile information
-> Préférences / Preferences (les filtres)
  - Choisissez qui vous souhaitez voir / Choose who you want to see
-> Paramètres du compte / Account settings
  - Gérez vos notifications, vos paramètres de confidentialité et votre compte / Manage your notifications, privacy settings and account
-> Aides & support / Help & support
  - FAQ, tutoriel et contact / FAQ, tutorial and contact
-> Forfait premium / Plan premium
  - Découvrez le forfait premium / Discover the premium plan


    ------ Modifier le profil / Edit the profile ------ 
                                        [BOUTON "Voir le profil / See profile"] à droite
    -> Nom d'affichage / Display name ("String") limite 12 caracteres                              displayName
    -> À propos de moi / About me ("String...") limite 120 caracteres                             about.aboutMe
    -> Nous pourrions être compatibles si / We might be compatible if ("String...") limite 120 caracteres                             about.compatibleIf

    -> Ce que je cherche / What I am looking for (["meetings", "friends", "loveRelationship"])    about.desiredMeetingType
    -> Relation / Relationship (["Single", "married"])                                            about.relationship

    -> Sexualité / Sexuality (["straight", "..."])                                                about.sexualOrientation

    -> Centre d'intérêt / Points of interest (["friends", "hikes", "..."])   => les tags          poi

    -> Date de naissance / Date of Birth                                                          birthAt

    -> Taille / Height (180) en cm                                                                physicalAppearance.height
    -> Poids / Weight (60) en kg                                                                  physicalAppearance.weight
    -> Tatouage / Tattoo ("not", "some", "many")                                                  physicalAppearance.tattoo
    -> Pilosité / Hairiness ("smooth", "shaved", "notVery", "hairy", "veryHairy")                 physicalAppearance.hairiness
    -> Barbe / Beard ("without", "threeDayBeard", "mustache", "goatee", "beard")                  physicalAppearance.beard    showIf gender === 'm'

    -> Poste / Job                                                                                career.job
    -> Employeur / Employer                                                                       career.employer
    -> École / School                                                                             career.school

    -> Langues parlées / Spoken languages (["english", "french"])                                 about.spokenLanguages
    -> Enfants / Children (["iHave", iWant", "iDontWant"])                                        about.children
    -> Alcool / Alcohol  (["occasionally", "..."])
    -> Tabac / Tobacco  (["non-smoker", "..."])
    -> Sport / Sport (["cardio", "..."])
    -> Cuisine / Cooking (["...", "..."])
    -> Voyages / Travels (["...", "..."])
    
    ------ Préférences / Preferences ------ 
    -> Je recherche ("m" / "f" / "mf")                                                            preferencesFilter.desiredGender
    -> Tranche d'âge / De X à X ans [18, 25]                                                      preferencesFilter.desiredAgeRange
    -> Avec au moins une photo                                                                    preferencesFilter.profileWithPhotoOnly
    
    ------ Paramètres du compte / Account settings ------ 
    -> Notifications / Notifications
    -> Confidentialité / Privacy
    -> Compte / User account
    -> Légal / Legal

        ------ Notifications / Notifications ------ 
        -> Me notifier quand un utilisateur m'envoie un message [Oui - Non]                       preferencePushNotification.userSendsMessage
        -> Me notifier quand un utilisateur m'envoie une requete d'amitié [Oui - Non]             preferencePushNotification.userSendsFriendRequest
        -> ...

        ------ Confidentialité / Privacy ------ 
        -> Afficher ma distance                                                                   privacy.showMyDistance
        -> Afficher ma localisation sur la Map                                                    privacy.showMyLocationOnMap
        -> Blocage                                                                               privacy.blockedUsers
        -> ...

        ------ Compte / User account ------ 
        -> Modifier l'email                                                                       email
        -> Modifier le mot de passe                                                               password
        -> Système d'unités [Impérial - Métrique] / Unit system [Imperial - Metric]              preferenceAccount.unitSystem
        -> Déconnection
        -> Supprimer le compte (en rouge)

        ------ Légal / Legal ------ 
        -> ...
    
    ------ Aides & support / Help & support ------ 
    -> Aide / Help
    -> Contact (email) / Contact

Uncategorize people

UserPhotoForProfile
  userId: String, // primary
  mainFileId: { type: String }, // renamed
  list: [{
    fileId: String,
    size_40_40: String, // Small, for mini preview in chat, comments, ...
    size_130_130: String, // Medium, for grids
    size_320_400: String, // Large, for full size previews
    provider: { type: String, default: 'local' },
    album: { type: String, default: 'public' }
  }]
get => UserPhotoForProfile.find({ userId });
delete one => UserPhotoForProfile.delete({ userId, 'list.fileId': fileId });
update mainFileId => UserPhotoForProfile.findOneAndUpdate({ userId }, { mainFileId: '...' });

=> Get users() + user() + me()                  => faire un populate/lookup sur "userphotoforprofiles" (impact coté back-end seulement)
=> Get threads() + thread()  + userInterXxx()   => faire un populate/lookup sur "userphotoforprofiles" (impact coté back-end seulement)
NOTE = ON FAIT PAS (au final on double les requêtes + lookup à faire partout)


# Storage messages in local:
  - https://github.com/techfort/LokiJS (for Web only)
  - https://github.com/ammarahm-ed/react-native-mmkv-storage
  - https://github.com/mrousavy/react-native-mmkv
  - https://github.com/sunnylqm/react-native-storage
  - ** https://github.com/Nozbe/WatermelonDB
  - ** https://github.com/realm/realm-js

  Si le destinataire ne peut pas le recevoir => stocké sur le serveur

  - ✅ Possibilité 1) Avoir seulement "threadMessage" en localDB & "thread" sur serveur et garder les "latestMessage" sur serveur (dans "threadMessage")
    - ✅ Problème avec la suppression des threads (swipe) => geré avec "ignoredBy"
    - ✅ Problème de gestion des updates de "readBy" & "replyBy" 
      1) Savoir si message has been fetched (= deleted from server) or not 
      2) re-create temporairement / update les messages modifiés sur le server => TODO gerer ca avec un findXxxAndUpdate() qui fait un AUTO create ??
    - ✅ unreadMessages => No changes
    - ✅ Vérifier qu'on a pas deja fetch les messages => no re-fetch same
      - ✅ Ne pas fetch si deja fetched => {"fetchedBy": notMe}
    - Display only localMessages in view (don't merge serverMessages + localMessages with state)
    - ❌ Handle pagination + cache Apollo => Do it with states ?
    - ✅ Populates data ("author", "request", "readBy.user"), how handle it ? 
      - ✅ Storage all populate data in hard coded in object with "decorators/json" => update les messages modifiés sur le server pour avoir les populations mises à jour
      - ❌ OR store in local these entities : "UserInterSendRequest" => Needed for get updated populate data

  Steps when fetch new messages:
  1) Fetch messages from server 
     - find({ threadId + fetchedBy: notMe })
  2) Store messages in localDB
     - Handle merging messages (two types of messages: "updated (readBy, replyBy)" OR "created (new)")
  3) Delete messages in server if needed (after then() of created localDB)
     - If lastParticipant fetched (use "fetchedBy") => canDeleteMessages (We need to look message by message for know if message can be deleted, can't do it by message's group)
     - If NOT lastParticipant fetched => In server => set {"fetchedBy": userMeId} for messages

  - ❌ Possibilité 2) Avoir seulement threadMessage en local db | thread sur server + Get les latestMessage en local (avec un localMessages.find() en js)
      localMessages = [{ threadId: '1', latest: {}, messages: [{}] }, {...}];
      threads.map((thread) => { localMessages.find({ threadId: thread._id }) });
