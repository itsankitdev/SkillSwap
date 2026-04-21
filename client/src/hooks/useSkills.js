import { useState, useEffect } from 'react';
import api from '../api/axios';

const useSkills = (filters = {}) => {
  const [skills, setSkills] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(
          Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        ).toString();
        const { data } = await api.get(`/skills?${params}`);
        setSkills(data.data.skills);
        setPagination(data.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [JSON.stringify(filters)]);

  return { skills, pagination, loading, error };
};

export default useSkills;