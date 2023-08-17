import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, ScrollView, Pressable } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';

const NewTaxi = () => {
    const navigation = useNavigation();

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

    const [firstInputValue, setFirstInputValue] = useState('');
    const [secondInputValue, setSecondInputValue] = useState('');

    const handleRegister = () => {
        if (firstInputValue.trim() === '' || secondInputValue.trim() === '') {
            Alert.alert('لا يمكن الترك فارغة', '');
        } else if (firstInputValue !== secondInputValue) {
            Alert.alert('القيمتان غير متطابقتين', '');
        } else if (firstInputValue.length < 3 || firstInputValue.length > 6) {
            Alert.alert('Error', '');
        } else {
            // Code to handle successful registration
            insertCodeIntoTable();
            navigation.navigate('SignIn');
        }
    };

    const insertCodeIntoTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO code (code) VALUES (?)',
                [parseInt(firstInputValue)],
                (tx, results) => {
                    console.log('Code inserted successfully');
                },
                (error) => {
                    console.log('Insert code error', error);
                }
            );
        });
    };




    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">
            <View>
                <Header />
                <View style={styles.container}>
                    <Text style={styles.label}>تسجيل رقم طاكسي جديد</Text>
                    <TextInput
                        placeholder=" "
                        style={styles.input}
                        value={firstInputValue}
                        keyboardType="numeric"
                        onChangeText={(text) => setFirstInputValue(text)}
                    />
                    <Text style={styles.label}>تأكيد الرقم</Text>
                    <TextInput
                        placeholder=" "
                        style={styles.input}
                        value={secondInputValue}
                        keyboardType="numeric"
                        onChangeText={(text) => setSecondInputValue(text)}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <View style={[styles.button, { margin: 15 }]}>
                        <Button title="تسجيل" onPress={handleRegister} />
                    </View>
                </View>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        // marginTop: 100,

    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#000',

    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        marginHorizontal: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
    }
});

export default NewTaxi;
