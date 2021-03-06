// @ts-nocheck
/*
 * Produced: Fri Jan 21 2022
 * Author: Alec M.
 * GitHub: https://amattu.com/links/github
 * Copyright: (C) 2022 Alec M.
 * License: License GNU Affero General Public License v3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Modules
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref as dRef } from 'firebase/database';
import { getStorage, getDownloadURL, listAll, ref as sRef } from "firebase/storage";
import dotenv from 'dotenv';

// Pull configuration
dotenv.config();

// Initialize Firebase
const db = {};
const configuration = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
const onValueOpts = {onlyOnce: true};

// Setup Handles
db._firebase = initializeApp(configuration);
db._database = getDatabase(db._firebase);
db._storage = getStorage(db._firebase);

/**
 * Get all inventory items from the database
 *
 * @return Promise<Array<Inventory>>
 * @author Alec M.
 */
db.getActiveInventory = async () => {
  return new Promise((resolve, reject) => {
    onValue(dRef(db._database, process.env.FIREBASE_RTD_ACTIVE_INVENTORY), (snapshot) => {
      const d = snapshot.val();

      if (d && typeof(d) === "object") {
        resolve(Object.values(d));
      } else {
        resolve(null);
      }
    }, onValueOpts);
  });
};

/**
  * Find all files in the storage bucket
  *
  * @param {number} StockNum
  * @returns Promise<Array<string>>
*/
db.getInventoryItemImages = async (StockNum = 0) => {
  return new Promise((resolve, reject) => {
    const images = [];

    listAll(sRef(db._storage, process.env.FIREBASE_STO_ACTIVE_INVENTORY + "/" + StockNum)).then((files) => {
      files.items.forEach(file => {
        images.push(file.name);
      });

      resolve(images);
    });
  });
};

/**
 * Get an active inventory item from the database by StockNum
 *
 * @param {number} StockNum
 * @param {bool} withImages include vehicle image links
 * @returns Promise<Inventory>
 * @author Alec M.
 */
db.getActiveInventoryItem = async (StockNum, withImages = false) => {
  return new Promise((resolve, reject) => {
    onValue(dRef(db._database, process.env.FIREBASE_RTD_ACTIVE_INVENTORY + "/" + StockNum), (snapshot) => {
      const vehicle = snapshot.val();
      vehicle.Images = [];

      // Pull Images
      if (withImages) {
        listAll(sRef(db._storage, process.env.FIREBASE_STO_ACTIVE_INVENTORY + "/" + StockNum)).then((files) => {
          files.items.forEach(file => {
            vehicle.Images.push(file.name);
          });

          resolve(vehicle);
        });
      } else {
        resolve(vehicle);
      }
    }, onValueOpts);
  });
};

// Export Variables
export default db;
