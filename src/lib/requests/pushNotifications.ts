export async function subscribeToPush(registration: ServiceWorkerRegistration, token: string) {
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC;

    try {
        if (!navigator.serviceWorker.controller) {
            throw new Error("installed but not controllering")
        }
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            console.log("Already subscribed")
            return;
        }

        const shouldRegister = confirm("In order to get notifications correctly, you must register your device. Would you like to do so?")
        if (!shouldRegister) {
            return;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
        })
        .then((resp) => {
            if (!resp.ok) {
                throw new Error("an error occurred while registring for subscribe");
            }
            alert("You've been registered for notifications");
        }).catch((err) => {
            console.log(err);
            alert("An error occurred while registering you for notifications. Please refresh to try again.")
            registration.unregister();
            throw err;
        });
    } catch (error) {
        console.error("failed to subscribe to push notifications:", error);
        alert(error);
        throw error;
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}