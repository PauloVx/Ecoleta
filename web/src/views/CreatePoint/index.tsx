import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
	id      : number;
	title   : string;
	item_url: string;
}

interface IBGEUFResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [formData, setFormdata] = useState({
		name: '',
		email: '',
		whatsapp: ''
	});

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
	const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);

	const history = useHistory();

	//Recebendo os items do backend.
	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data.serializedItems);
		});
	}, []);

	//Recebendo a lista de ufs da api do IBGE.
	useEffect(() => {
		axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUfs(ufInitials);
		})
	}, []);

	//Carregar cidades de acordo com a uf.
	useEffect(() => {
		if(selectedUf === '0') return;
		
		axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cityNames = response.data.map(city => city.nome);
			setCities(cityNames);
		})
	}, [selectedUf]);

	//Recebendo a posição atual do usuário.
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(pos => {
			const {latitude, longitude} = pos.coords;

			setUserPosition([latitude, longitude]);
		});
	}, []);

	function handleSelectedUf(e: ChangeEvent<HTMLSelectElement>) {
		const value = e.target.value;
		setSelectedUf(value);
	}

	function handleSelectedCity(e:ChangeEvent<HTMLSelectElement>) {
		const value = e.target.value;
		setSelectedCity(value);
	}

	function handleMapClick(e: LeafletMouseEvent) {
		setSelectedPosition([e.latlng.lat, e.latlng.lng]);
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		const {name, value} = e.target;
		setFormdata({...formData, [name]: value})
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id);

		if(alreadySelected >= 0) {
			const filteredItems = selectedItems.filter(item => item !== id);
			setSelectedItems(filteredItems);
		}
		else setSelectedItems([...selectedItems, id]);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		
		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;

		const data = {
			name,
			email,
			whatsapp,
			uf,
			city,
			latitude, longitude,
			items
		};

		await api.post('points', data);

		alert('Ponto de coleta criado!');

		history.push('/');
	}
	
	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta logo"/>
				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br /> ponto de coleta</h1>
				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input
							type="text"
							name="name"
							id="name"
							onChange={handleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								name="email"
								id="email"
								onChange={handleInputChange}
							/>
						</div>
						<div className="field">
						<label htmlFor="whatsapp">Whatsapp</label>
						<input
							type="text"
							name="whatsapp"
							id="whatsapp"
							onChange={handleInputChange}
						/>
					</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={userPosition} zoom={15} onclick={handleMapClick}>
					<TileLayer
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					<Marker position={selectedPosition} />
					</Map>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
								<option value="0">Selecione um estado</option>
								{ufs.map(uf => (
									<option value={uf} key={uf}>{uf}</option>
								))}
							</select>
						</div>
						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
								<option value="0">Selecione uma cidade</option>
								{cities.map(city => (
									<option value={city} key={city}>{city}</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>

					<ul className="items-grid">
						{items.map(item => (
							<li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
								<img src={item.item_url} alt={item.title}/>
								<span>{item.title}</span>
							</li>
						))}	
					</ul>
				</fieldset>
				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	)
}

export default CreatePoint;