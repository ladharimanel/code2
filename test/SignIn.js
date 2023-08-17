import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, Modal, Pressable } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import RNPrint from 'react-native-print';
import Header from './header';


const SignIn = () => {
    const [inputCode, setInputCode] = useState('');
    const [additionalInput, setAdditionalInput] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

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

    //current date and time 
    const currentTime = new Date().toLocaleString();

    //verifier le code entré avec la BD 
    const verifyCode = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM code WHERE code = ?',
                [inputCode],
                (_, result) => {
                    if (result.rows.length > 0) {
                        setVerificationResult('matched');//code existe
                        setIsModalVisible(true);
                    } else {
                        setVerificationResult('not_matched');//code n'existe pas
                        Alert.alert('رقم الطاكسي غير موجود');
                    }
                },
                (_, error) => {
                    console.log('Error verifying code:', error);
                }
            );
        });
    };
    //imprimer la valeur saisie et la date
    const printData = () => {
        const htmlContent = `<html><body>
        <h1>${currentTime}</h1>
        <h1>${additionalInput}</h1>
        </body></html>`;
        RNPrint.print({ html: htmlContent });

    };
    // fermer la fenetre et remise à 0
    const closeModal = () => {
        setIsModalVisible(false);
        setInputCode(null);
        setAdditionalInput(null);
    };
    //UI
    return (
        <>
        <Header/>
            <View style={styles.container}>
                <Text style={styles.label}>رقم الطاكسي: </Text>
                <TextInput
                    value={inputCode}
                    onChangeText={setInputCode}
                    secureTextEntry={true}
                    keyboardType="numeric"
                    placeholder=" "
                    style={styles.input}
                />


                {verificationResult === 'not_matched' && (
                    <Text style={styles.error}>الرقم غير موجود</Text>
                )}


                <Button title="اثبات" onPress={verifyCode} />
            </View>

            {/*Display the modal if the code matches */}
           <Modal visible={isModalVisible} animationType="slide" transparent={true} >
                <View style={styles.modalContainer}>
                    <TextInput
                        value={additionalInput}
                        onChangeText={setAdditionalInput}
                        placeholder="Saisie donnée"
                        style={styles.input}
                />
                    <View style={styles.buttonContainer}>
                        <View style={[styles.button, { margin: 15 }]}>
                            <Button title="طبع" onPress={printData} />
                        </View>
                        <View style={[styles.button, { margin: 15 }]}>
                            <Button title="Close" onPress={closeModal} />
                        </View>
                    </View>

               </View>
            </Modal>
        </>
    );
};
//Styles
const styles = StyleSheet.create({
    modalContainer: {
        margin: 30,
        marginTop: 250,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        padding: 45,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        }
    },
    buttonContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
    },
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        marginTop: 250,

    },
    label: {
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
        marginBottom: 8,

    },
});

export default SignIn;
