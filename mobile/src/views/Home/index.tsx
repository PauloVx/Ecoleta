import React, { useState } from 'react';
import { View, Image, Text, ImageBackground, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler'
import { Feather as FeatherIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

const logo = require('../../assets/logo.png');
const homeBackground = require('../../assets/home-background.png')

const Home = () => {
	const navigation = useNavigation();

	const [uf, setUf] = useState('');
	const [city, setCity] = useState('');

	function navigateToPoints() {
		navigation.navigate('Points', {
			uf, city
		});
	}

	return (
		<KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ImageBackground style={styles.container} source={homeBackground} imageStyle={{width: 274, height:368}}>
				<View style={styles.main}>
					<Image source={logo}/>
					<View>
						<Text style={styles.title}>
							Seu marketplace de coleta de resíduos.
						</Text>
						<Text style={styles.description}>
							Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
						</Text>
					</View>
				</View>

				<View style={styles.footer}>
					<TextInput
						style={styles.input}
						placeholder="Digite a UF"
						value={uf}
						maxLength={2}
						autoCapitalize='characters'
						autoCorrect={false}
						onChangeText={input => setUf(input)}
					/>

					<TextInput
						style={styles.input}
						placeholder="Digite a Cidade"
						value={city}
						autoCorrect={false}
						onChangeText={input => setCity(input)}
					/>

					<RectButton style={styles.button} onPress={ navigateToPoints }>
						<View style={styles.buttonIcon}>
							<FeatherIcons name="arrow-right" color="#FFF" size={24}/>
						</View>
						<Text style={styles.buttonText}>Entrar</Text>
					</RectButton>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
};

export default Home;