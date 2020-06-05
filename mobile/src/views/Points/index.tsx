import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather as FeatherIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'

import api from '../../services/api'

import styles from './styles';

interface Item {
	id: number;
	title: string;
	item_url: string;
}

interface Point {
	id: number;
	name: string;
	image: string;
	latitude: number;
	longitude: number;
}

interface Params {
	uf: string;
	city: string;
}

const Points = () => {
	const navigation = useNavigation();
	const route = useRoute();

	const routeParams = route.params as Params;

	const [items, setItems] = useState<Item[]>([]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [points, setPoints] = useState<Point[]>([]);
	const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);

	useEffect(() => {
		api.get('points', {
			params: {
				city: routeParams.city,
				uf: routeParams.uf,
				items: selectedItems
			}
		}).then(response => {
			setPoints(response.data);
		});
	}, [selectedItems]);

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data.serializedItems);
		});
	}, []);

	useEffect(() => {
		async function loadPosition() {
			const { status } = await Location.requestPermissionsAsync();

			if(status !== 'granted') {
				Alert.alert('Ooops...', 'precisamos de sua permissão para obter a localização.')
				return;
			}

			const location = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = location.coords;

			setUserPosition([ latitude, longitude ]);
		}

		loadPosition();
	}, []);

	function navigateBack() {
		navigation.goBack();
	}

	function markerNavigate(id: number) {
		navigation.navigate('Detail', { point_id: id });
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id);

		if(alreadySelected >= 0) {
			const filteredItems = selectedItems.filter(item => item !== id);
			setSelectedItems(filteredItems);
		}
		else setSelectedItems([...selectedItems, id]);
	}

	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={navigateBack}>
					<FeatherIcons name="arrow-left" size={20} color="#34CB79" />
				</TouchableOpacity>
				<Text style={styles.title}>Bem Vindo.</Text>
				<Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

				<View style={styles.mapContainer}>
					{ userPosition[0] !== 0 && (
						<MapView 
							style={styles.map}
							initialRegion={{latitude: userPosition[0], longitude: userPosition[1], latitudeDelta: 0.014, longitudeDelta: 0.014}} >
							{points.map(point => (
								<Marker onPress={() => markerNavigate(point.id)} style={styles.mapMarker} coordinate={{latitude:point.latitude, longitude:point.longitude}} key={String(point.id)}>
									<View style={styles.mapMarkerContainer}>
										<Image style={styles.mapMarkerImage} source={{uri: point.image}} />
										<Text style={styles.mapMarkerTitle}>{point.name}</Text>
									</View>
								</Marker>
							))}
						</MapView>
					) }
				</View>
			</View>
			<View style={styles.itemsContainer}>
				<ScrollView horizontal contentContainerStyle={{paddingHorizontal: 20}}>
					{items.map(item => (
						<TouchableOpacity
							style={selectedItems.includes(item.id) ? [styles.item, styles.selectedItem] : styles.item}
							onPress={ () => handleSelectItem(item.id) }
							key={String(item.id)} 
							activeOpacity={0.6}>
								<SvgUri width={42} height={42} uri={item.item_url}/>
								<Text style={styles.itemTitle}>{item.title}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</>
	)
}

export default Points;
