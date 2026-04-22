# Système de Paiement des Écolages

Ce document décrit le fonctionnement du processus de paiement des écolages dans l'application.

## Flux de Travail

Le processus de paiement suit les étapes suivantes :

1.  **Frontend (React) :**
    - Dans la page `Students.jsx`, l'utilisateur sélectionne un ou plusieurs écolages impayés pour un élève.
    - Le composant gère une liste d'IDs numériques des écolages sélectionnés (`selectedFeesToPay`).
    - Lors de la confirmation, la méthode `FeeService.pay(selectedFeesToPay)` est appelée.

2.  **API (Symfony / API Platform) :**
    - La requête `POST /api/fees/pay` est envoyée avec un corps JSON contenant les `feeIds`.
    - Cette opération utilise un DTO `FeePaymentInput` pour la désérialisation.
    - Un processeur d'état personnalisé `FeePaymentProcessor` traite la demande.

3.  **Traitement (Backend) :**
    - `FeePaymentProcessor` récupère les entités `Fee` par leurs IDs.
    - Il marque chaque écolage comme payé (`isPaid = true`) et définit la date de paiement.
    - Après avoir persisté les changements, il déclenche un événement `FeePaidEvent`.

4.  **Comptabilité (Événement) :**
    - `FeePaidListener` écoute l'événement `FeePaidEvent`.
    - Pour chaque écolage payé, il crée automatiquement un mouvement comptable (`AccountingMovement`) de type 'entry' et de catégorie 'fee'.
    - Le libellé du mouvement est généré selon le format : `ecolage-{prenom}-{nom}-{mois}-{annee}-{classe}`.

## Points Clés

- **Filtres API :** La récupération des écolages impayés utilise le filtre `student.id` sur l'entité `Fee`.
- **Validation :** Le backend vérifie l'existence de chaque ID d'écolage et ne traite que ceux qui ne sont pas encore marqués comme payés.
- **Automatisation :** La création des mouvements comptables est totalement découplée grâce au système d'événements de Symfony.
