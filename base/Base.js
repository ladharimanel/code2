import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const Base = () => {
    const codes = [
        { code: 14789 },
        { code: 12369 },
        { code: 15987 },
        { code: 15963 },
        { code: 17930 },
        { code: 12345 },
        { code: 56789 },
        { code: 45678 },
        { code: 98765 },
        { code: 54321 },
    ];
    const users = [
        { matricule: '0123', name: 'user1' },
        { matricule: '4567', name: 'user2' },
        { matricule: '8910', name: 'user3' },
        { matricule: '1112', name: 'user4' },
        { matricule: '1314', name: 'user5' },
    ];

    const version = 
        { version: '1' }

    useEffect(() => {
        // Database connection
        const db = SQLite.openDatabase({
            name: 'mydb',
            location: 'default',
        });

        // Create table code function
        const createTable = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS code (code INTEGER PRIMARY KEY)',
                    [],
                    () => {
                        console.log('Table code created successfully');
                        insertCodes();
                    },
                    (error) => {
                        console.log('Create table error', error);
                    }
                );
            });
        };

        //Create table users function 
        const createUserTable = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS user (matricule TEXT PRIMARY KEY, name TEXT)',
                    [],
                    () => {
                        console.log('Table code created successfully');
                        insertUsers();
                    },
                    (error) => {
                        console.log('Create table error', error);
                    }
                );
            });
        };

        //Create table version 
        const createVersionTable = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS version (version INTEGER)',
                    [],
                    () => {
                        console.log('Table version created successfully');
                        insertVersion();
                    },
                    (error) => {
                        console.log('Create table error', error);
                    }
                );
            });
        };

        // Insert codes into the table
        const insertCodes = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM code LIMIT 1',
                    [],
                    (_, result) => {
                        if (result.rows.length === 0) {
                            codes.forEach((code) => {
                                tx.executeSql(
                                    'INSERT INTO code (code) VALUES (?)',
                                    [code.code],
                                    (_, insertResult) => {
                                        console.log(
                                            'Code created successfully.',
                                            insertResult.insertId
                                        );
                                    },
                                    (_, error) => {
                                        console.log('Create code error:', error);
                                    }
                                );
                            });
                        } else {
                            console.log('Code records already exist. Skipping creation.');
                        }
                    },
                    (_, error) => {
                        console.log('Error checking existing codes:', error);
                    }
                );
            });
        };

        //Insert data into version table
        const insertVersion = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM version LIMIT 1',
                    [],
                    (_, result) => {
                        if (result.rows.length === 0) {
                            version.forEach((version) => {
                                tx.executeSql(
                                    'INSERT INTO version (version) VALUES ( ?)',
                                    [version.version],
                                    (_, insertResult) => {
                                        console.log(
                                            'version created successfully.',
                                            insertResult.insertId
                                        );
                                    },
                                    (_, error) => {
                                        console.log('Create version error:', error);
                                    }
                                );
                            });
                        } else {
                            console.log('version records already exist. Skipping creation.');
                        }
                    },
                    (_, error) => {
                        console.log('Error checking existing version:', error);
                    }
                );
            });
        };


        //Insert data into user table
        const insertUsers = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM user LIMIT 1',
                    [],
                    (_, result) => {
                        if (result.rows.length === 0) {
                            users.forEach((user) => {
                                tx.executeSql(
                                    'INSERT INTO user (matricule, name) VALUES (?, ?)',
                                    [user.matricule, user.name],
                                    (_, insertResult) => {
                                        console.log(
                                            'User created successfully.',
                                            insertResult.insertId
                                        );
                                    },
                                    (_, error) => {
                                        console.log('Create user error:', error);
                                    }
                                );
                            });
                        } else {
                            console.log('user records already exist. Skipping creation.');
                        }
                    },
                    (_, error) => {
                        console.log('Error checking existing users:', error);
                    }
                );
            });
        };

        createTable(); // Call create table code function here
        createUserTable(); //Call create table user function here
        createVersionTable(); //call create table version 

          /* db.transaction((tx) => {
               tx.executeSql(
                 'SELECT * FROM offline_tickets',
                 [],
                 (tx, results) => {
                   const rows = results.rows;
                   for (let i = 0; i < rows.length; i++) {
                     console.log(rows.item(i));
                   }
                 },
                 (error) => {
                   console.error(error);
                 }
               );
             });*/

       /* db.transaction((tx) => { 
            tx.executeSql("DELETE FROM today", [],
                function (tx, results) { console.log("Successfully Emptied"); },
                function (tx, error) { console.log("Could not Empty"); }
            );
        });*/

    }, []);


    return (
        <View>
            <Text></Text>
        </View>
    );
};

export default Base;
