import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, Pressable } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Header from './Header';
import LottieView from 'lottie-react-native';


const LogIn = ({ onLoginStatus, onUserName, onUserMatricule, onLoginDate }) => {

    const [matricule, setMatricule] = useState(false);
    const [verification, setVerification] = useState(null);

    const loginDate = new Date().toLocaleTimeString();

    // Database connection
    const db = SQLite.openDatabase(
        {
            name: 'mydb',
            location: 'default',
        },
        () => {
            console.log('Database connected!');
        },
        (error) => console.log('Database error', error)
    );

    const handleLogin = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM user WHERE matricule = ? ',
                [matricule],
                (_, results) => {
                    if (results.rows.length > 0) {
                        // Login successful
                        const userName = results.rows.item(0).name;
                        onUserName(userName); // Pass the user's name to the parent component
                        onUserMatricule(matricule); // Pass the user's matricule to the parent component
                        setVerification('exist'); //matricule existe
                        onLoginStatus(true); // Pass the login status back to SignIn component
                        onLoginDate(loginDate); // Pass login date to the parent component
                        console.log('matricule existe');
                    } else {
                        // Invalid credentials
                        setVerification('do_not_exist'); //matricule n'existe pas
                        console.log('matricule n existe pas');
                    }
                },
                (_, error) => {
                    console.log('Error verifying user:', error);
                }
            );
        });
    };

    return (
        <View>
            <Header />
            <View style={styles.container}>
                <View>
                    <LottieView
                        source={require('../lotties/taxi-driver.json')}
                        autoPlay
                        loop
                        style={{ width: 200, height: 200 }}
                    />
                </View>
                <Text style={styles.label}> الرجاء ادخال رقم التسجيل : </Text>
                <TextInput
                    value={matricule}
                    onChangeText={setMatricule}
                    //secureTextEntry={true}
                    keyboardType="numeric"
                    placeholder="  "
                    style={[styles.input, { fontSize: 40 }]}
                />
                {verification === 'do_not_exist' && (
                    <Text style={styles.error}>المعرف غير موجود</Text>
                )}
                {verification === 'exist' && (
                    <Text style={styles.correct}>المعرف موجود</Text>
                )}
                <Button title="تسجيل الدخول" onPress={handleLogin} />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        //marginTop: 100,

    },
    label: {
        fontSize: 20,
        marginBottom: 8,
        color: '#000',
        fontWeight: 'bold' ,
    },
    input: {
        height: '20%',
        width: '100%',
        borderColor: 'gray',
        borderWidth: 2,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
        marginBottom: 8,

    },
    correct: {
        color: 'green',
        marginBottom: 8,

    },

})
export default LogIn;