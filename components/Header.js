import React from 'react';
import { Text, View, StyleSheet, Image, Dimensions } from 'react-native';
import Logo from '../images/logoicon.png';

const windowWidth = Dimensions.get('window').width;

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}> المؤسسة العمومية الاقتصادية{'\n'} لنقل المسافرين بالشرق{'\n'}
                مركز الفحص التقني سطيف {'\n'}
                EPE-TVE</Text>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
        <View style={{position: 'absolute', top: 80, left: 50}}>
        <Text style={{color:'orange'}}>V.15</Text>
        </View>
      </View>
    </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'gray',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    resizeMode: 'contain',
    height: 100,
    width: 180,
  },
  logoText: {
    //marginLeft: 10,
    color: 'orange',
    fontSize: 16,
  },
  text: {
    color: 'orange',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Header;
