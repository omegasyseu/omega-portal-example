# OMEGA Portal 5

Player-facing demo portal that showcases the player features the OMEGA backend (IPS) already exposes.

## Language

### Brands & Content

**Brand**:
The unit that owns a portal's content and settings: which games are shown, banners, Collections, Payment Methods and its **Brand Theme**.
_Avoid_: Client, tenant, site

**Brand Theme**:
How a **Brand** looks: its **Colour Mode**, its **Brand Colours** and its logo. Every Brand has exactly one; layout, components, type and motion are the same for all of them. Today there are two: the **Dark Theme** (Dark Mode with the Omega Wins colours, the default) and the **Light Theme** (Light Mode with the Kambi colours). The logo is always the Brand's own, whichever theme it uses.
_Avoid_: Skin (that's the reskin project), white-label, template

**Colour Mode**:
Whether a **Brand Theme**'s pages are dark or light: **Dark Mode** (near-black pages) or **Light Mode** (light pages under a shell in the Brand's deepest colour). It sets the surfaces and text; the header, sidebar and menus stay dark in both.
_Avoid_: Theme (that's the whole look), colour scheme (Mantine's term for how it draws one)

**Brand Colours**:
A **Brand Theme**'s own accent colours: its main colour for actions, the call-to-action colour for sign-up and money actions, the signal colour for wins and active states, gold for jackpots, and the podium and danger colours. They work in either **Colour Mode**.
_Avoid_: Palette (the code's word for Brand Colours and Colour Mode together)

**Client**:
An OMEGA customer that owns one or more **Brands**. Content never belongs to a Client directly.
_Avoid_: Brand, tenant, operator

**Selected Brand**:
The **Brand** the visitor has picked, whose **Brand Theme**, games and banners the portal shows. It is remembered between visits; on a first visit it is the first Brand IPS lists. Right after a new pick, the previous Brand stays on screen until the Selected Brand's content has loaded. It cannot change while a player is signed in, so a player always signs in, signs up and plays in the Selected Brand.
_Avoid_: Current brand, active brand, default brand

**Lobby**:
The ordered list of games a **Brand** offers. All Games, search and the Brand's **Collections** draw from it; a game it doesn't list is a **Disabled Game** for that Brand.
_Avoid_: Game list, casino page

**Collection**:
A named group of games, such as Featured or New Releases, that an admin defines once for every **Brand**. Each Brand chooses which Collections it shows, in what order, and which games from its **Lobby** each one holds. A shown Collection is a link under Games in the menu and a tab on the Games page, and a game can be in several.
_Avoid_: Category (that's what a game is), section, tab

**Game Category**:
What a game is: slots or sportsbook for now. It belongs to the game and is the same in every **Brand**. A sportsbook opens differently from a slot.
_Avoid_: Collection (a Brand's own grouping), genre, game type

**Disabled Game**:
A game the **Brand**'s **Lobby** doesn't list, so it is missing from that Brand's Lobby, **Collections** and search. Not listing it does not block a launch by direct link.
_Avoid_: Removed game, blocked game

**Game Catalogue**:
Every game an environment knows, shared by all its **Brands**. It starts with the games every new environment is seeded with, and editors add more. A Brand's **Lobby** picks from it.
_Avoid_: Game list, lobby

**Engage Feature**:
One of the player-engagement features the portal can show: Jackpot, Challenge, Level Up, Quest and Leaderboard. Each **Brand** shows every Engage Feature unless an editor hides it.
_Avoid_: Gamification, social features, Social Center (that's the menu group)

**Hidden Engage Feature**:
An **Engage Feature** a **Brand** has chosen not to show: no link, widget, banner or other way into it appears on the Brand's pages. Its page still opens by direct link.
_Avoid_: Disabled feature, turned-off feature

**Legal Page**:
One of the five pages every **Brand** publishes for anyone to read, signed in or not: Gaming Rules, **Player Protection Information**, Terms and Conditions, Privacy Policy, and Complaints and Contact. Each Brand writes its own text for each one; the footer of every page links to all five.
_Avoid_: Static page, policy page, CMS page

**Cookie Notice**:
The message that tells a visitor, on their first visit, that the portal uses cookies, and points to the Privacy Policy. It informs; it asks for no choice and blocks nothing.
_Avoid_: Cookie consent, cookie banner

### Payments

**Payment Method**:
A way a player deposits or withdraws money, such as OMEGA Bank or an e-voucher. OMEGA decides which ones a **Brand** has and which a player may use; each Brand chooses, separately for deposits and for withdrawals, which of those it shows, and may show one under its own name and logo. A Brand can hide a Payment Method OMEGA offers, but never show one OMEGA doesn't.
_Avoid_: Payment provider, PSP (the company behind a method), cashier

### Accounts

**Full Sign-up**:
Opening an account with everything IPS needs (`/signup`), in two steps: email and password, then the player's details. The account is opened in the **Selected Brand**. The player is fully registered once they verify their code.
_Avoid_: Registration (the old page name), long sign-up

**Quick Sign-up**:
Opening an account with the minimum (username, email, mobile, password, date of birth) through `/quickSignup`. The player verifies their code and can sign in, but is **Quick-registered** until they **Complete Registration**.
_Avoid_: Fast sign-up, short registration

**Quick-registered (QUICK_REG)**:
The registration status of a player who used **Quick Sign-up** and hasn't given their name and address yet. They can browse, but are asked to **Complete Registration** before they play or pay.
_Avoid_: Partial account, unverified (verification is the code, a separate step)

**Complete Registration**:
Adding the name and address a **Quick-registered** player still owes (`/quickSignupCompletion`), from the prompt, Play, a payment page or the profile.
_Avoid_: Step 2 (that is Full Sign-up's second step), finish sign-up

**Registration Status**:
How much of the account the player has filled in: **Quick-registered** until they **Complete Registration**, then a full player. It says nothing about **KYC**.
_Avoid_: Account status, KYC status

**KYC**:
The brand's check of a player's identity, done by staff reviewing the player's documents or by a KYC provider. It is separate from **Registration Status** and from the code verified at sign-up: a fully registered player may not have passed KYC.
_Avoid_: Verification, verified (that is the sign-up code), approval

**KYC Status**:
Where a player stands in **KYC**, set by staff or a KYC provider. Approving a player's documents does not set it on its own. The portal only informs the player about it; whatever it blocks, the brand blocks.
_Avoid_: Verification status, document status

**KYC State**:
What the player is told about their **KYC Status**: **Verified**, **Action Needed** (the brand is asking for something), **Under Review** (nothing to do but wait) or **Not Verified** (no check has started). Account problems such as suspension or a security alert are never shown as a KYC State.
_Avoid_: KYC level, verification stage

**Primary Account**:
The player's main account; each additional currency the player holds is an **Associated Account** linked to it.
_Avoid_: Main wallet, base account

**Associated Account**:
A secondary, single-currency account of the same player that can be switched to from the account list in the header's balance menu (the "wallet" pill, a UI control, not an account).
_Avoid_: Sub-account, currency wallet

**Bonus**:
A reward credited to one player under a bonus plan, which must be wagered a set amount before it can be released. It is active until it is released, cancelled or expires. The **Promotions** page lists a player's active and expired Bonuses.
_Avoid_: Promotion (the page, not the reward), offer

### Responsible Gaming

**Responsible Gaming (RG)**:
The set of player self-protection tools: limits on money and time, and the ability to lock oneself out.
_Avoid_: Safer gambling, player protection, Responsible Play

**Player Protection Information**:
The **Legal Page** that tells anyone, signed in or not, how the **Brand** protects players: the risks of gambling, the **Responsible Gaming** tools it offers and where to get help. It describes the tools; it is not where a player uses them.
_Avoid_: Responsible Gaming page (that's the tools), player protection (alone)

**RG Limit**:
A player-set cap of one **Limit Type** over one **Period**, held on the player's **Primary Account** regardless of the currency currently selected.
_Avoid_: Personal limit, player limit

**Limit Type**:
What an **RG Limit** caps. In scope: Deposit, Wager, Loss, Session, Reality Check.

**Period**:
The fixed window a money **RG Limit** accumulates over: Daily, Weekly or Monthly.
_Avoid_: Interval (reserved for **Reality Check**), dynamic period

**Pending Limit**:
An increase or removal of an **RG Limit** that has been requested but not yet taken effect; it becomes active on its effective date. Decreases never become pending.
_Avoid_: Scheduled limit

**Cool-down**:
The number of days a **Pending Limit** waits before taking effect, set per brand.
_Avoid_: Cooling-off (that is a lock, not a delay)

**Session Limit**:
The maximum length of a single logged-in session, in minutes.
_Avoid_: Time limit, game time limit

**Reality Check**:
A recurring reminder interval, in minutes, telling the player how long they have been playing.
_Avoid_: Session reminder

**Self-exclusion**:
A player-requested, temporary lock of their own account for a chosen duration. It ends the current session and can only be lifted by staff.
_Avoid_: Timeout, cool-off, take a break (a distinct, shorter lock not in scope), account closure

### History

**History Date Range**:
The From and To calendar dates a player picks to filter Transaction, Gaming or Bonus history. Both dates are inclusive whole days, read as written in the server's timezone (the same timezone the history rows are shown in); the player's own timezone never shifts them.
_Avoid_: Time range
