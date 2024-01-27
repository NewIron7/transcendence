'use server'

import axios from "axios";
import { cookies, headers } from 'next/headers'


export async function updateEmail(newEmail: string) {
    const cookies = headers().get('Cookie');
    if (!cookies)
        return false;

    const url = process.env.BACKEND_USER_EMAIL;
    if (!url)
        return ('BACKEND_USER_EMAIL is not defined in the environment variables.');

    return await axios.post(url,
        {
            newEmail: newEmail,
        },
        {
            headers: { 'Cookie': cookies },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            if (error.response.data.message.message) {
                return (error.response.data.message.message);
            }
            return "No error message";
        });
}

export async function turn2fa(event: boolean) {
    const cookies = headers().get('Cookie');
    if (!cookies)
        return false;

    const urlOn = process.env.FORTYTWO_TURNON_2FA;
    const urlOff = process.env.FORTYTWO_TURNOFF_2FA;
    if (!urlOn || !urlOff)
        return ('FORTYTWO_TURNON_2FA not defined in the environment variables.');

    if (event) {
        return await axios.get(urlOn,
            {
                headers: { 'Cookie': cookies },
            })
            .then(res => {
                return { qrcode: res.data };
            })
            .catch(error => {
                if (error.response.data.message.message) {
                    return (error.response.data.message.message);
                }
                return "No error message";
            });
    } else {
        return await axios.get(urlOff,
            {
                headers: { 'Cookie': cookies },
            })
            .then(res => {
                return { message: "2FA successfully desactivated" };
            })
            .catch(error => {
                if (error.response.data.message.message) {
                    return (error.response.data.message.message);
                }
                return "No error message";
            });
    }

}

export async function checkUserExist(username: string) {
    const cookies = headers().get('Cookie');
    if (!cookies || !username)
        return false;

    const url = process.env.NEXT_PUBLIC_BACKEND_USER_OTHER;
    if (!url)
        throw new Error('NEXT_PUBLIC_BACKEND_USER_OTHER is not defined in the environment variables.');

    return await axios.get(url + username, {
        headers: { 'Cookie': cookies },
    })
        .then(res => {
            return true;
        })
        .catch(error => {
            if (error.response.data.message.message) {
                return (error.response.data.message.message);
            }
            return "Error while searching for " + username;
        });
}
