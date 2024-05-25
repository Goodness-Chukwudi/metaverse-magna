
const BIT = Object.freeze({
    ON: 1,
    OFF: 0
});

const PASSWORD_STATUS = Object.freeze({
    ACTIVE: "active",
    DEACTIVATED: "deactivated",
    COMPROMISED: "compromised",
    BLACKLISTED: "blacklisted"
});

const ITEM_STATUS = Object.freeze({
    ACTIVE: 'active',
    DEACTIVATED: 'deactivated',
    DELETED: 'deleted',
    APPROVED: 'approved',
});

const EVENT_OPTIONS = Object.freeze({
    ALL_EVENTS: 'all_events',
    SENDER: 'sender',
    RECEIVER: 'receiver',
    SENDER_OR_RECEIVER: 'receiver_or_sender',
});

export {
    BIT,
    PASSWORD_STATUS,
    ITEM_STATUS,
    EVENT_OPTIONS
}