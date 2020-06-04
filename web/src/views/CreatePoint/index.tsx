import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
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

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

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
	
	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta logo"/>
				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>

			<form action="">
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
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="name">Email</label>
							<input
								type="email"
								name="email"
								id="email"
							/>
						</div>
						<div className="field">
						<label htmlFor="whatsapp">Whatsapp</label>
						<input
							type="text"
							name="whatsapp"
							id="whatsapp"
						/>
					</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={[-22.8493711,-43.2618207]} zoom={15} onclick={handleMapClick}>
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
							<li key={item.id}>
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