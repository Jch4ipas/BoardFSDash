class Event {
    constructor(startDate, endDate, eventSubject, organizerName) {
        this.debut = startDate;
        this.fin = endDate;
        this.sujet = eventSubject;
        this.organisateur = organizerName;
    }
}

async function getGraphToken() {
    const TENANT_ID = process.env.TENANT_ID;
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials",
        }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
        throw new Error(JSON.stringify(tokenData));
    }
    return tokenData.access_token;
}

async function fetchCalendarEvents(roomEmail, token, startDateTime, endDateTime) {
    const calendarUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(roomEmail)}/calendarView?startDateTime=${startDateTime.toISOString()}&endDateTime=${endDateTime.toISOString()}&$select=subject,start,end,organizer`;
    const calendarResponse = await fetch(calendarUrl, {
        headers: { 
            Authorization: `Bearer ${token}`, 
            Prefer: 'outlook.timezone="UTC"' 
        }
    });
    if (!calendarResponse.ok) {
        throw new Error(`Graph Error ${calendarResponse.status}`);
    }
    const calendarData = await calendarResponse.json();
    const events = calendarData.value || [];
    return events.map(e => new Event(
        new Date(e.start.dateTime + 'Z').toISOString(),
        new Date(e.end.dateTime + 'Z').toISOString(),
        e.subject || "Sans titre",
        e.organizer?.emailAddress?.name || "Inconnu"
    )).sort((a, b) => new Date(a.debut) - new Date(b.debut));
}

export default async (roomName) => {
    try {
        const room = roomName.toLowerCase() + "@epfl.ch";
        const startDateTime = new Date();
        const endDateTime = new Date();
        endDateTime.setUTCHours(23, 59, 59, 999);
        const token = await getGraphToken();
        const items = await fetchCalendarEvents(room, token, startDateTime, endDateTime);
        if (items.length === 0) {
            return { error: { code: "errUserNoData", message: "No data during provided period." } };
        }
        return items;
    } catch (error) {
        console.error("Erreur dans getOnPremEvents:", error);
        return { error: { code: "errServer", message: error.message } };
    }
}