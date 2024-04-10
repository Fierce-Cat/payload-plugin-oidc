import { Response } from 'express';
import jwt from 'jsonwebtoken';
import payload from 'payload';
import type { oidcPluginOptions } from '../types';
import { Field, fieldAffectsData, fieldHasSubFields } from 'payload/dist/fields/config/types';
import getCookieExpiration from 'payload/dist/utilities/getCookieExpiration';
import { PayloadRequest, SanitizedCollectionConfig } from 'payload/types';
import { verify } from '../lib/oauth/verify';

export const connectHandler =
  (opts: oidcPluginOptions, userCollectionSlug: string) => async (req: PayloadRequest, res: Response) => {
    console.log(req.query);
    // If the query contain redirect_uri, save it to a temporary cookie
    if (req.query.redirect_uri) {
      res.cookie(opts.redirectUriCookieName || 'payload-connect-redirect-uri'
      , req.query.redirect_uri, {
        path: '/',
        sameSite: 'strict',
      });
    }

    // Redirect to the OIDC provider
    return res.redirect(opts.initPath);
  };

export const loginHandler =
  (opts: oidcPluginOptions, userCollectionSlug: string) => async (req: PayloadRequest, res: Response) => {
    // Get the Mongoose user
    const collectionConfig = payload.collections[userCollectionSlug].config;

    // Sanitize the user object
    // let user = userDoc.toJSON({ virtuals: true })
    let user = JSON.parse(JSON.stringify(req.user));

    // Decide which user fields to include in the JWT
    const fieldsToSign = getFieldsToSign(collectionConfig, user);

    // Sign the JWT
    const token = jwt.sign(fieldsToSign, payload.secret, {
      expiresIn: collectionConfig.auth.tokenExpiration,
    });

    // Set cookie
    res.cookie(`${payload.config.cookiePrefix}-token`, token, {
      path: '/',
      httpOnly: true,
      expires: getCookieExpiration(collectionConfig.auth.tokenExpiration),
      secure: collectionConfig.auth.cookies.secure,
      sameSite: collectionConfig.auth.cookies.sameSite,
      domain: collectionConfig.auth.cookies.domain || undefined,
    });

    // Read the redirect_uri from the temporary cookie in the headers
    const headerCookie = req.headers.cookie;
    const cookieName = opts.redirectUriCookieName || 'payload-connect-redirect-uri';
    const redirectUri = headerCookie?.split(';').find((cookie) => cookie.includes(cookieName))?.split('=')[1];


    if (redirectUri) {
      // Clear the temporary cookie
      res.clearCookie(cookieName, {
        path: '/',
      });

      const encodedURI = decodeURIComponent(redirectUri);
      console.log(encodedURI);

      // Redirect to the original URL
      return res.redirect(encodedURI);
    }

    // Redirect to admin dashboard
    return res.redirect('/admin');
  };

const getFieldsToSign = (collectionConfig: SanitizedCollectionConfig, user: any) => {
  return collectionConfig.fields.reduce(
    (signedFields, field: Field) => {
      const result = {
        ...signedFields,
      };

      if (!fieldAffectsData(field) && fieldHasSubFields(field)) {
        field.fields.forEach((subField) => {
          if (fieldAffectsData(subField) && subField.saveToJWT) {
            result[subField.name] = user[subField.name];
          }
        });
      }

      if (fieldAffectsData(field) && field.saveToJWT) {
        result[field.name] = user[field.name];
      }

      return result;
    },
    {
      email: user.email,
      id: user.id,
      collection: collectionConfig.slug,
    } as any,
  );
};
