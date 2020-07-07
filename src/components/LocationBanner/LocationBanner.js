// @flow

import React, { useEffect, useState, Fragment, useRef } from "react";
import ReactTooltip from "react-tooltip";
import { Container, Closer } from "./LocationBanner.styles";
import type { ComponentType } from "react";


const joiner = (index, len) => {

    switch ( index ) {
        case len - 2:
            return ", and "
        case len - 1:
            return null;
        default:
            return ", "

    }

};  // joiner


const getCookie = ( cookieName: string ) => {

    const
        name = `${cookieName}=`,
        decodedCookie = decodeURIComponent(document.cookie),
        ca = decodedCookie.split(';');

    for ( let ind = 0; ind < ca.length; ind++ ) {
        let c = ca[ind];

        while ( c.charAt(0) === ' ' ) {
            c = c.substring(1);
        }

        if ( c.indexOf(name) === 0 ) {
            return JSON.parse(c.substring(name.length, c.length));
        }
  }
  return "";

};  // getCookie


const setOrUpdateCookie = (cookieName: string, payload: {[string]: [string|number]}, expiration: Date, path: string = "/") => {

    const
        existingCookie = getCookie(cookieName),
        cookieData = { ...existingCookie, ...payload };

    document.cookie = (
        `${ cookieName }=` +
        `${ encodeURIComponent(JSON.stringify(cookieData)) }; ` +
        `expires=${ expiration.toUTCString() }; ` +
        `path=${ path }`
    );

};  // setOrUpdateCookie


const usePrevious = (value) => {

    const ref = useRef(value);

    useEffect(() => {

        ref.current = value

    })

    return ref.current

};  // usePrevious


const LocationBanner: ComponentType = ({ pageTitle, areaTypes, pathname }) => {

    const
        [ display, setDisplay ] = useState(false),
        lenAreaTypes = areaTypes.length,
        cookieName = "LocationBanner",
        cookieData = getCookie(cookieName)?.[pathname] ?? {},
        prevPathname = usePrevious(pathname);

    useEffect(() => {

        if ( prevPathname !== pathname && Object.keys(cookieData) ) {

            const
                today = new Date,
                appData = areaTypes
                    .reduce((acc, item) => ({ ...acc, [item.suggestion]: item.lastUpdate }), {});

            const isDismissed = Object
                .keys(appData)
                .every(suggestion => {
                    const
                        pageCookieDateString = cookieData?.[suggestion] ?? "",
                        pageCookieDate = new Date(pageCookieDateString);

                    return (
                        pageCookieDateString &&
                        pageCookieDate <= today &&
                        (cookieData?.[suggestion] ?? "") === appData[suggestion]
                    )

                });

            setDisplay(!isDismissed)

        }

    }, [ cookieData, pathname, prevPathname ]);

    useEffect(() => {

        if ( !pageTitle ) setDisplay(false)

    });

    const dismiss = () => {

        const
            today = new Date(),
            [year, month, day] = [today.getFullYear(), today.getMonth(), today.getDate()],
            nextMonth = new Date(year, month + 1, day > 28 ? 28 : day),
            payload = areaTypes
                .reduce((acc, item) => ({ ...acc, [item.suggestion]: item.lastUpdate }), {});

        setOrUpdateCookie(cookieName, { [pathname]: payload }, nextMonth)

        setDisplay(false);

    };  // dismiss

    if ( !display ) return null;

    return <Container>
        <p>
            { pageTitle } data are also available for&nbsp;{
            areaTypes.map((area, index) =>
                <Fragment key={ `${ area }-${ index }` }>
                    <strong>{ area.suggestion }</strong>
                    { joiner(index, lenAreaTypes) }
                </Fragment>
            ) }.
        </p>
        <Closer htmlType={ "button" }
                data-tip={ "Click to dismiss the banner" }
                data-for={ "dismiss-banner-tooltip" }
                onClick={ dismiss }>
            <span className={ "govuk-visually-hidden" }>
                Click to dismiss the banner.
            </span>
        </Closer>
        <ReactTooltip id={ "dismiss-banner-tooltip" }
                      place={ "right" }
                      backgroundColor={ "#0b0c0c" }
                      className={ "tooltip" }
                      effect={ "solid" }/>
    </Container>

}; // LocationBanner


export default LocationBanner;