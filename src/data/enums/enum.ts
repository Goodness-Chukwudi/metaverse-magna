
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

export {
    BIT,
    PASSWORD_STATUS,
    ITEM_STATUS
}